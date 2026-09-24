using System.Threading.RateLimiting;
using DppGateway;
using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOptions<DppGatewayOptions>().BindConfiguration("DppGateway").ValidateOnStart();
builder.Services.AddSingleton<IValidateOptions<DppGatewayOptions>, DppGatewayOptionsValidator>();
builder.Services.AddSingleton<DppAccessTokenProvider>();
builder.Services.AddSingleton(provider =>
    NpgsqlDataSource.Create(
        provider
            .GetRequiredService<IOptions<DppGatewayOptions>>()
            .Value.PublicationRegistryConnectionString
    )
);
builder.Services.AddSingleton<DppPublicationRegistry>();
builder.Services.AddSingleton<IDppPublicationRegistry>(provider =>
    provider.GetRequiredService<DppPublicationRegistry>()
);
var gatewayMode = builder.Configuration.GetValue("DppGateway:Mode", DppGatewayMode.SingleTenant);
var publicRateLimitPermitLimit = builder.Configuration.GetValue(
    "DppGateway:PublicRateLimitPermitLimit",
    DppGatewayOptions.DefaultPublicRateLimitPermitLimit
);
var publicRateLimitWindowSeconds = builder.Configuration.GetValue(
    "DppGateway:PublicRateLimitWindowSeconds",
    60
);
if (gatewayMode == DppGatewayMode.SingleTenant)
{
    builder.Services.AddSingleton<SingleTenantDppRouteResolver>();
    builder.Services.AddSingleton<IDppRouteResolver>(provider =>
        provider.GetRequiredService<SingleTenantDppRouteResolver>()
    );
    builder.Services.AddSingleton<IDppInfrastructureRouteResolver>(provider =>
        provider.GetRequiredService<SingleTenantDppRouteResolver>()
    );
}
else
{
    builder.Services.AddSingleton<MultiTenantDppRouteResolver>();
    builder.Services.AddSingleton<IDppRouteResolver>(provider =>
        provider.GetRequiredService<MultiTenantDppRouteResolver>()
    );
    builder.Services.AddSingleton<IDppInfrastructureRouteResolver>(provider =>
        provider.GetRequiredService<MultiTenantDppRouteResolver>()
    );
}
builder
    .Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = builder.Configuration["DppGateway:PublisherAuthority"];
        var metadataAddress = builder.Configuration["DppGateway:PublisherMetadataAddress"];
        if (!string.IsNullOrWhiteSpace(metadataAddress))
            options.MetadataAddress = metadataAddress;
        var publisherAudience = builder.Configuration["DppGateway:PublisherAudience"];
        var accessTokenAudience = builder.Configuration["DppGateway:AccessTokenAudience"];
        options.RequireHttpsMetadata = builder.Configuration.GetValue(
            "DppGateway:PublisherRequireHttpsMetadata",
            !builder.Environment.IsDevelopment()
        );
        var validIssuer = builder.Configuration["DppGateway:PublisherValidIssuer"];
        if (!string.IsNullOrWhiteSpace(validIssuer))
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidIssuer = string.IsNullOrWhiteSpace(validIssuer) ? null : validIssuer,
                ValidAudiences = new[] { publisherAudience, accessTokenAudience }.Where(value =>
                    !string.IsNullOrWhiteSpace(value)
                ),
                ValidateAudience = true,
            };
    });
builder.Services.AddAuthorization(options =>
    options.AddPolicy(
        "dpp-publisher",
        policy =>
            policy
                .RequireAuthenticatedUser()
                .RequireClaim("dpp_publish", "true")
                .RequireClaim("tenant_id")
    )
);
builder
    .Services.AddHttpClient<DppUpstreamClient>(client =>
    {
        client.Timeout = TimeSpan.FromSeconds(15);
        client.DefaultRequestHeaders.UserAgent.ParseAdd("aas-suite-dpp-gateway/1.0");
    })
    .ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler { AllowAutoRedirect = false });
builder
    .Services.AddHttpClient<DppAttachmentService>(client =>
    {
        client.Timeout = TimeSpan.FromSeconds(30);
        client.DefaultRequestHeaders.UserAgent.ParseAdd("aas-suite-dpp-gateway/1.0");
    })
    .ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler { AllowAutoRedirect = false });
builder
    .Services.AddHttpClient("dpp-oauth")
    .ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler { AllowAutoRedirect = false });
builder.Services.AddHealthChecks().AddCheck<DppPublicationRegistry>("publication-registry");
builder.Services.AddOpenApi();
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders =
        ForwardedHeaders.XForwardedFor
        | ForwardedHeaders.XForwardedProto
        | ForwardedHeaders.XForwardedHost;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy(
        "public-dpp-read",
        context =>
            RateLimitPartition.GetFixedWindowLimiter(
                context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = publicRateLimitPermitLimit,
                    Window = TimeSpan.FromSeconds(publicRateLimitWindowSeconds),
                    QueueLimit = 0,
                }
            )
    );
});

var app = builder.Build();

await app
    .Services.GetRequiredService<DppPublicationRegistry>()
    .InitializeAsync(app.Lifetime.ApplicationStopping);

app.UseForwardedHeaders();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.MapHealthChecks(
    "/health",
    new HealthCheckOptions { ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse }
);

app.MapGet(
        "/dpp/v1/attachments/{dppToken}/{attachmentToken}",
        async Task<IResult> (
            string dppToken,
            string attachmentToken,
            HttpContext context,
            IDppRouteResolver routeResolver,
            DppUpstreamClient upstreamClient,
            DppAttachmentService attachmentService,
            CancellationToken cancellationToken
        ) =>
        {
            var dppId = DppAttachmentService.DecodeToken(dppToken);
            if (string.IsNullOrWhiteSpace(dppId))
                return Results.BadRequest(new { error = "INVALID_DPP_ID" });
            var route = await routeResolver.ResolveAsync(dppId, cancellationToken);
            if (route == null)
                return Results.NotFound(new { error = "DPP_NOT_PUBLISHED" });

            var representation = await upstreamClient.GetDppRepresentationAsync(
                route,
                dppId,
                GetSubjectToken(context),
                cancellationToken
            );
            if (representation.Error != null)
                return representation.Error;
            return await attachmentService.GetAsync(
                route,
                representation.Payload!,
                attachmentToken,
                cancellationToken
            );
        }
    )
    .RequireRateLimiting("public-dpp-read")
    .Produces(StatusCodes.Status200OK)
    .Produces(StatusCodes.Status400BadRequest)
    .Produces(StatusCodes.Status401Unauthorized)
    .Produces(StatusCodes.Status403Forbidden)
    .Produces(StatusCodes.Status404NotFound)
    .Produces(StatusCodes.Status429TooManyRequests)
    .Produces(StatusCodes.Status502BadGateway)
    .WithName("GetPublicDppAttachment")
    .WithSummary("Returns an attachment visible in the caller's view of a published DPP.");

app.MapGet(
        "/dpp/v1/dpps/{**dppId}",
        async Task<IResult> (
            string dppId,
            HttpContext context,
            IDppRouteResolver routeResolver,
            DppUpstreamClient upstreamClient,
            DppAttachmentService attachmentService,
            CancellationToken cancellationToken
        ) =>
        {
            var decodedDppId = DppIdentifier.Decode(dppId);
            if (decodedDppId == null)
                return Results.BadRequest(new { error = "INVALID_DPP_ID" });

            var route = await routeResolver.ResolveAsync(decodedDppId, cancellationToken);
            if (route == null)
                return Results.NotFound(new { error = "DPP_NOT_PUBLISHED" });

            var representation = await upstreamClient.GetDppRepresentationAsync(
                route,
                decodedDppId,
                GetSubjectToken(context),
                cancellationToken
            );
            if (representation.Error != null)
                return representation.Error;
            var payload = attachmentService.RewriteUrls(
                representation.Payload!,
                decodedDppId,
                context.Request
            );
            return new DppJsonResult(
                payload,
                representation.ContentType!,
                null,
                representation.LastModified
            );
        }
    )
    .RequireRateLimiting("public-dpp-read")
    .Produces(StatusCodes.Status200OK, contentType: "application/json")
    .Produces(StatusCodes.Status400BadRequest)
    .Produces(StatusCodes.Status401Unauthorized)
    .Produces(StatusCodes.Status403Forbidden)
    .Produces(StatusCodes.Status404NotFound)
    .Produces(StatusCodes.Status429TooManyRequests)
    .Produces(StatusCodes.Status502BadGateway)
    .WithName("GetPublicDpp")
    .WithSummary("Returns a published digital product passport by its DPP identifier.");

app.MapPut(
        "/management/publications/{**dppId}",
        [Authorize(Policy = "dpp-publisher")]
        async Task<IResult> (
            string dppId,
            HttpContext context,
            IDppInfrastructureRouteResolver infrastructureResolver,
            DppUpstreamClient upstreamClient,
            IDppPublicationRegistry registry,
            CancellationToken cancellationToken
        ) =>
        {
            var decodedDppId = DppIdentifier.Decode(dppId);
            if (decodedDppId == null)
                return Results.BadRequest(new { error = "INVALID_DPP_ID" });
            var infrastructureId = context.User.FindFirst("tenant_id")?.Value;
            var route =
                infrastructureId == null
                    ? null
                    : infrastructureResolver.ResolveInfrastructure(infrastructureId);
            if (route == null)
                return Results.Forbid();
            if (!await upstreamClient.IsActiveAsync(route, decodedDppId, cancellationToken))
                return Results.Conflict(new { error = "DPP_NOT_ACTIVE" });

            await registry.PublishAsync(decodedDppId, infrastructureId!, cancellationToken);
            return Results.NoContent();
        }
    )
    .ExcludeFromDescription();

app.MapDelete(
        "/management/publications/{**dppId}",
        [Authorize(Policy = "dpp-publisher")]
        async Task<IResult> (
            string dppId,
            HttpContext context,
            IDppPublicationRegistry registry,
            CancellationToken cancellationToken
        ) =>
        {
            var decodedDppId = DppIdentifier.Decode(dppId);
            if (decodedDppId == null)
                return Results.BadRequest(new { error = "INVALID_DPP_ID" });
            var infrastructureId = context.User.FindFirst("tenant_id")?.Value;
            var registeredInfrastructure = await registry.GetInfrastructureIdAsync(
                decodedDppId,
                cancellationToken
            );
            if (infrastructureId == null || registeredInfrastructure != infrastructureId)
                return Results.NotFound();

            await registry.UnpublishAsync(decodedDppId, cancellationToken);
            return Results.NoContent();
        }
    )
    .ExcludeFromDescription();

app.Run();

static string? GetSubjectToken(HttpContext context) =>
    context.User.Identity?.IsAuthenticated == true
        ? context
            .Request.Headers.Authorization.ToString()
            .Replace("Bearer ", string.Empty, StringComparison.OrdinalIgnoreCase)
            .Trim()
        : null;

public partial class Program;
