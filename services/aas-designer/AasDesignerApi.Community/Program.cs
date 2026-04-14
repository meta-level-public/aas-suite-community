using System.Reflection;
using AasDesignerAasApi.ServerSentEvent;
using AasDesignerAasApi.Shells.Queries.GetShellList;
using AasDesignerApi;
using AasDesignerApi.AasApi;
using AasDesignerApi.Apikey;
using AasDesignerApi.Auth;
using AasDesignerApi.Authorization;
using AasDesignerApi.Benutzer;
using AasDesignerApi.EClass;
using AasDesignerApi.Import;
using AasDesignerApi.Instantiation;
using AasDesignerApi.Invoice;
using AasDesignerApi.Jobs;
using AasDesignerApi.LegalLinks;
using AasDesignerApi.Localization;
using AasDesignerApi.Mail;
using AasDesignerApi.Middleware;
using AasDesignerApi.Model;
using AasDesignerApi.Model.Configuration;
using AasDesignerApi.Orga;
using AasDesignerApi.Packaging;
using AasDesignerApi.PaymentModel;
using AasDesignerApi.Service;
using AasDesignerApi.Statistics;
using AasDesignerApi.SubmodelTemplate;
using AasDesignerApi.Utils;
using AasDesignerAuthorization;
using AasDesignerCommon.Statistics;
using AasDesignerCommon.Utils;
using AasDesignerDashboardApi.Dashboard.Queries.GetDashboard;
using AasDesignerHelpApi.HelpTexts.Queries.GetAllHelpTexts;
using AasDesignerModel;
using AasDesignerModel.Model;
using AasDesignerSharedLinksApi.SharedLinks.Queries.GetMySharedLinks;
using AasDesignerSystemManagementApi.SystemManagement.Model;
using AasDesignerSystemManagementApi.SystemManagement.Queries.GetConfiguration;
using AasShared.Configuration;
using AasShared.Middleware;
using AasShared.Submodels;
using AspNetCore.Proxy;
using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;
using NSwag;
using NSwag.AspNetCore;
using NSwag.Generation.Processors.Security;
using VwsPortalApi.Cors;
using VwsPortalApi.RequestForOffer;

var builder = WebApplication.CreateBuilder(
    new WebApplicationOptions
    {
        Args = args,
        ContentRootPath = ConfigurationSetup.ResolveAppSettingsBasePath(
            Directory.GetCurrentDirectory()
        ),
    }
);

builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.KeepAliveTimeout = TimeSpan.FromSeconds(15);
});

builder.Host.ConfigureAppSettings();

builder.Services.AddLogging();
AasDesignerBootstrap.ConfigureLogging(builder.Logging);

#pragma warning disable ASP0000
var logger = builder.Services.BuildServiceProvider().GetRequiredService<ILogger<Program>>();
#pragma warning restore ASP0000

AasDesignerBootstrap.ConfigureDatabase(
    builder.Services,
    builder.Configuration,
    builder.Environment
);
AasDesignerBootstrap.ConfigureCoreWebServices(builder.Services);

builder.Services.AddScoped<AasApiExceptionFilter>();
builder.Services.AddScoped<InternalApiExceptionFilter>();

builder.Services.AddSingleton<NameplateManager>();
builder.Services.AddSingleton<DocumentManager>();
builder.Services.AddSingleton<IdentificationManager>();
builder.Services.AddSingleton<IdtaService>();
builder.Services.AddSingleton<MailService>();
builder.Services.AddSingleton<IMailSettingsRuntimeService, MailSettingsRuntimeService>();
builder.Services.AddSingleton<
    ILegalLinksSettingsRuntimeService,
    LegalLinksSettingsRuntimeService
>();
builder.Services.AddSingleton<EmailUtilService>();

builder.Services.AddSingleton<SubmodelUpdateMessageStore>();
builder.Services.AddSingleton<PcnUpdateMessageStore>();
builder.Services.AddSingleton<ShellUpdateMessageStore>();
builder.Services.AddSingleton<ImportProgressMessageStore>();
builder.Services.AddSingleton<SseClientStore>();

var appSettings = AasDesignerBootstrap.GetRequiredConfiguration<AppSettings>(
    builder.Configuration,
    "AppSettings"
);
builder.Services.AddSingleton(appSettings);

builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblyContaining<Program>());
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssemblyContaining<GetShellListHandler>()
);
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssemblyContaining<GetMySharedLinksHandler>()
);
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssemblyContaining<GetDashboardHandler>()
);
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssemblyContaining<GetConfigurationHandler>()
);
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssemblyContaining<GetAllHelpTextsHandler>()
);

builder.Services.AddAutoMapper(cfg =>
{
    cfg.AddMaps(Assembly.GetExecutingAssembly());
    var assemblyNames = Assembly
        .GetExecutingAssembly()
        .GetReferencedAssemblies()
        .Where(a => a.Name != null && a.Name.Contains("AasDesigner"))
        .ToList();
    var assemblies = assemblyNames.Select(Assembly.Load);
    cfg.AddMaps(assemblies);
});

AasDesignerBootstrap.RegisterOptionalSingleton<EmailConfiguration>(
    builder.Services,
    builder.Configuration,
    "EmailConfiguration"
);
AasDesignerBootstrap.RegisterOptionalSingleton<LegalLinksConfiguration>(
    builder.Services,
    builder.Configuration,
    "LegalLinksConfiguration"
);
AasDesignerBootstrap.RegisterOptionalSingleton<FileStorageConfiguration>(
    builder.Services,
    builder.Configuration,
    "FileStorageConfiguration"
);
AasDesignerBootstrap.RegisterOptionalSingleton<EclassConfiguration>(
    builder.Services,
    builder.Configuration,
    "EclassConfiguration"
);

builder.Services.AddOpenApiDocument(config =>
{
    config.DocumentName = "Internal API";
    config.Title = "Internal API";
    config.Description = "Internal API for interaction with frontend";
    config.PostProcess = document =>
    {
        document.Info.Version = "v1.0";
        document.Info.Contact = new NSwag.OpenApiContact { Name = "Meta Level Software AG" };
    };
    config.ApiGroupNames = ["internal", "internal-orga"];
    config.SchemaSettings.DefaultReferenceTypeNullHandling = NJsonSchema
        .Generation
        .ReferenceTypeNullHandling
        .NotNull;
});
builder.Services.AddOpenApiDocument(config =>
{
    config.DocumentName = "New Internal API";
    config.Title = "New Internal API";
    config.Description = "New Internal API for interaction with frontend with generated Client";
    config.PostProcess = document =>
    {
        document.Info.Version = "v1.0";
        document.Info.Contact = new NSwag.OpenApiContact { Name = "Meta Level Software AG" };
    };
    config.ApiGroupNames =
    [
        "internal-aas",
        "internal-orga",
        "internal-sharedlinks",
        "internal-dashboard",
        "internal-system-management",
        "help",
        "aas-viewer",
    ];
    config.SchemaSettings.DefaultReferenceTypeNullHandling = NJsonSchema
        .Generation
        .ReferenceTypeNullHandling
        .NotNull;
});
builder.Services.AddOpenApiDocument(document =>
{
    document.DocumentName = "AAS API";
    document.Title = "AAS API";
    document.Description = "Implementation of official AAS API";

    document.PostProcess = document =>
    {
        document.Info.Version = "v1.0";
        document.Info.Contact = new NSwag.OpenApiContact { Name = "Meta Level Software AG" };
    };
    document.ApiGroupNames =
    [
        "publicApi",
        "aasRegistry",
        "aasRepository",
        "aasxFileserver",
        "submodelRepository",
        "submodelRegistry",
        "serialization",
        "description",
        "conceptDescription",
        "aas",
        "submodel",
    ];
    document.SchemaSettings.DefaultReferenceTypeNullHandling = NJsonSchema
        .Generation
        .ReferenceTypeNullHandling
        .NotNull;
    document.AddSecurity(
        "JWT",
        new OpenApiSecurityScheme
        {
            Type = OpenApiSecuritySchemeType.ApiKey,
            Name = "Authorization",
            In = OpenApiSecurityApiKeyLocation.Header,
            Description = "Type into the textbox: Bearer {your JWT token}.",
        }
    );
    document.OperationProcessors.Add(new AspNetCoreOperationSecurityScopeProcessor("JWT"));
});

builder.Services.AddRouting(options => options.LowercaseUrls = true);
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = long.MaxValue;
});

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin();
        policy.AllowAnyMethod();
        policy.AllowAnyHeader();
    });
});

builder.Services.AddScoped<AdresseService>();
builder.Services.AddScoped<BenutzerService>();
builder.Services.AddScoped<OrganisationService>();
builder.Services.AddScoped<InfrastructureRequester>();
builder.Services.AddScoped<ProductFamilyService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<IUserService>(provider => provider.GetRequiredService<UserService>());
builder.Services.AddScoped<JwtUtils>();
builder.Services.AddScoped<IJwtUtils>(provider => provider.GetRequiredService<JwtUtils>());
builder.Services.AddScoped<KeycloakAdminService>();
builder.Services.AddScoped<EclassCertificateService>();
builder.Services.AddScoped<EclassImportService>();
builder.Services.AddScoped<SnippetService>();
builder.Services.AddScoped<DashboardService>();
builder.Services.AddScoped<StatisticsLogger>();
builder.Services.AddScoped<NewsService>();
builder.Services.AddScoped<SubmodelTemplateService>();
builder.Services.AddScoped<EClassService>();
builder.Services.AddScoped<EClassProxyService>();
builder.Services.AddScoped<PaymentModelService>();
builder.Services.AddScoped<InvoiceService>();
builder.Services.AddScoped<ApikeyService>();
builder.Services.AddScoped<AASXPackager>();
builder.Services.AddMemoryCache(options =>
{
    options.SizeLimit = 1000;
});
builder.Services.AddSingleton<HttpCacheService>();
builder.Services.AddHostedService<StatisticCalculator>();
builder.Services.AddHostedService<DailyStatisticCalculator>();
builder.Services.AddHostedService<DailyExpiredOrganisationsChecker>();
builder.Services.AddHostedService<PeriodicOrganisationDeleter>();
builder.Services.AddHostedService<PeriodicInfrastructureDeleter>();
builder.Services.AddHostedService<IdtaCrawler>();
builder.Services.AddHostedService<PcnUpdateListener>();
builder.Services.AddHostedService<QueuedHostedService>();
builder.Services.AddSingleton<IBackgroundTaskQueue>(_ =>
{
    var queueCapacity = 1;
    return new BackgroundTaskQueue(queueCapacity);
});
builder.Services.AddScoped<EClassBackgroundService>();
builder.Services.AddScoped<VwsPortalApi.Cors.CorsService>();
builder.Services.AddScoped<ContactService>();
builder.Services.AddScoped<PublicApiConceptDescriptionService>();
builder.Services.AddScoped<RequestForOfferService>();
builder.Services.AddScoped<ApiKeyUserResolver>();
builder.Services.AddTransient<
    IConfigureOptions<MvcNewtonsoftJsonOptions>,
    AasDesignerApi.Middleware.JsonOptions
>();
builder.Services.AddProxies();

builder.Services.AddSpaStaticFiles(configuration =>
{
    configuration.RootPath = "wwwroot";
});

var app = builder.Build();

var fileExtensionProvider = new FileExtensionContentTypeProvider();
fileExtensionProvider.Mappings[".yaml"] = "application/yaml";
fileExtensionProvider.Mappings[".yml"] = "application/yaml";

app.UseStaticFiles(new StaticFileOptions { ContentTypeProvider = fileExtensionProvider });

app.UseSpaStaticFiles(new StaticFileOptions { ContentTypeProvider = fileExtensionProvider });

app.UseOpenApi(settings => settings.Path = "/openapi/{documentName}.json");
app.UseSwaggerUi(settings =>
{
    settings.SwaggerRoutes.Add(new SwaggerUiRoute("Internal API", "/openapi/Internal API.json"));
    settings.SwaggerRoutes.Add(
        new SwaggerUiRoute("New Internal API", "/openapi/New Internal API.json")
    );
    settings.SwaggerRoutes.Add(new SwaggerUiRoute("AAS API", "/openapi/AAS API.json"));
});

app.UseForwardedHeaders();
app.UseAuthentication();

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
    app.UseSpa(spa =>
    {
        spa.Options.SourcePath = "clientapp";
    });

    app.UseHsts();
}

app.UseStatusCodePages();
app.UseAuthorization();

app.Use(
    async (context, next) =>
    {
        context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
        context.Response.Headers.Append("X-Xss-Protection", "1");
        context.Response.Headers.Append("X-Frame-Options", "DENY");
        await next();
    }
);

app.UseMiddleware<OptionsMiddleware>();
app.UseMiddleware<CorsMiddleware>();
app.UseMiddleware<NoCacheMiddleware>();

app.UseMiddleware<VwsGeneratorJwtMiddleware>();
app.UseMiddleware<VwsGeneratorApikeyMiddleware>();
app.MapControllers();

app.UseResponseCompression();

AasSuiteContext.Configure(app.Services.GetService<IHttpContextAccessor>());

if (app.Environment.IsDevelopment())
{
    var lineArgs = Environment.GetCommandLineArgs();
    if (!lineArgs.Any(p => p.Contains("NSwag.AspNetCore.Launcher.dll")))
    {
        await WebApplicationExtensions.InitialiseDatabaseAsync(app, appSettings, logger);
    }
}
else
{
    await WebApplicationExtensions.InitialiseDatabaseAsync(app, appSettings, logger);
    app.UseHsts();
}

await app.RunAsync();

static class WebApplicationExtensions
{
    public static async Task InitialiseDatabaseAsync(
        WebApplication app,
        AppSettings appSettings,
        ILogger logger
    )
    {
        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetService<IApplicationDbContext>();
        var infrastructureRequester = scope.ServiceProvider.GetService<InfrastructureRequester>();
        var keycloakAdminService = scope.ServiceProvider.GetService<KeycloakAdminService>();

        if (dbContext == null)
        {
            return;
        }

        await dbContext.Database.MigrateAsync();

        if (!await dbContext.Benutzers.AnyAsync())
        {
            Organisation orga = new()
            {
                AccountAktiv = true,
                Name = appSettings.InitialOrganisationName,
                Strasse = appSettings.InitialOrganisationStrasse,
                Plz = appSettings.InitialOrganisationPlz,
                Ort = appSettings.InitialOrganisationOrt,
                Email = appSettings.InitialOrganisationEmail,
            };

            Benutzer b = new()
            {
                AccountAktiv = true,
                Email = appSettings.InitialOrganisationAdminEmail,
                Name = appSettings.InitialOrganisationAdminName,
                Vorname = appSettings.InitialOrganisationAdminVorname,
            };
            b.BenutzerRollen.Add(AuthRoles.SYSTEM_ADMIN);
            b.BenutzerRollen.Add(AuthRoles.ORGA_ADMIN);
            dbContext.Add(b);

            Benutzer sys = new()
            {
                AccountAktiv = true,
                Email = "system@hat.keine",
                Name = "user",
                Vorname = "system",
                IsSystemUser = true,
                BenutzerRollen = [AuthRoles.SYSTEM_ADMIN, AuthRoles.SYSTEM_HELP_EDITOR],
            };
            b.BenutzerRollen.Add(AuthRoles.INTERNAL_SYSTEM_USER);
            dbContext.Add(sys);

            var benutzerOrga = new BenutzerOrganisation
            {
                Benutzer = b,
                Organisation = orga,
                BenutzerRollen =
                [
                    AuthRoles.BENUTZER,
                    AuthRoles.ORGA_ADMIN,
                    AuthRoles.FEED_MAPPING_USER,
                    AuthRoles.ORGA_HELP_EDITOR,
                ],
                AccountAktiv = true,
            };
            dbContext.Add(benutzerOrga);
            var systemOrga = new BenutzerOrganisation
            {
                Benutzer = sys,
                Organisation = orga,
                BenutzerRollen = [AuthRoles.INTERNAL_SYSTEM_USER],
                AccountAktiv = true,
            };
            dbContext.Add(systemOrga);
            await dbContext.SaveChangesAsync();

            var freeModel = dbContext.PaymentModels.FirstOrDefault(p =>
                p.NameLabel == "UNLIMITED_ACCOUNT" && p.IsSystemModel
            );
            if (freeModel == null)
            {
                var paymentModel = new PaymentModel
                {
                    AenderungsBenutzer = "system",
                    AenderungsDatum = DateTime.Now,
                    AnlageBenutzer = "system",
                    AenderungsZaehler = 0,
                    AnlageDatum = DateTime.Now,
                    AnzahlNutzer = -1,
                    BeschreibungInternal = "Unlimited Account",
                    BeschreibungLabel = "UNLIMITED_ACCOUNT_EXPL",
                    IsSystemModel = true,
                    ExklusivBuchbar = true,
                    MehrfachBuchbar = false,
                    NameLabel = "UNLIMITED_ACCOUNT",
                    Name = "Unlimited Account",
                    Preis = 0,
                    Period = PaymentPeriod.MONTHLY,
                    UserSelectable = false,
                };

                dbContext.Add(paymentModel);
                await dbContext.SaveChangesAsync();
                freeModel = paymentModel;
            }

            var endDate = DateTime.Now.AddYears(100);
            OrganisationPaymentModel orgaPaymentModel = new()
            {
                AnlageDatum = DateTime.Now,
                AnlageBenutzer = "system",
                EndDate = endDate,
                OrganisationId = orga.Id,
                PaymentModel = freeModel,
            };
            dbContext.OrganisationPaymentModels.Add(orgaPaymentModel);

            await dbContext.SaveChangesAsync();

            logger.LogInformation("Initial Organisation and User created");

            if (!appSettings.SingleTenantMode)
            {
                logger.LogInformation("Requesting infrastructure for initial organisation");
                infrastructureRequester?.RequestInfrastructure(orga, "started");
                logger.LogInformation("Infrastructure requested for initial organisation");
            }
            else
            {
                SingleTenantInfrastructureUtil.CreateSingleTenantInfrastructure(
                    orga,
                    dbContext,
                    appSettings
                );
                logger.LogInformation("Single Tenant Mode: No infrastructure requested");
            }
        }

        if (appSettings.SingleTenantMode)
        {
            SingleTenantInfrastructureUtil.SynchronizeSingleTenantInfrastructureVersions(
                dbContext,
                appSettings
            );
        }

        await dbContext.SaveChangesAsync();
    }
}
