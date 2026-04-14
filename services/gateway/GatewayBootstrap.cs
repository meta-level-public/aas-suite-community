using System.IO;
using AasShared.Configuration;
using gateway.Bff;
using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.Caching.Postgres;

namespace gateway;

public static class GatewayBootstrap
{
    public static bool ShouldExposeOpenApi(IHostEnvironment environment) =>
        environment.IsDevelopment();

    public static bool ShouldUseHttpsRedirection(IHostEnvironment environment) =>
        !environment.IsDevelopment();

    public static void ConfigureHost(WebApplicationBuilder builder)
    {
        // Allow large upload payloads to pass through to downstream services (e.g. AASX imports).
        builder.WebHost.ConfigureKestrel(options =>
        {
            options.Limits.MaxRequestBodySize = null;
        });
    }

    public static void ConfigureServices(WebApplicationBuilder builder)
    {
        var appSettings = new AppSettings();
        builder.Configuration.GetSection("AppSettings").Bind(appSettings);
        builder.Services.AddSingleton(appSettings);

        var dataProtectionKeysPath = GetDataProtectionKeysPath(
            builder.Configuration,
            builder.Environment
        );
        Directory.CreateDirectory(dataProtectionKeysPath);

        builder
            .Services.AddDataProtection()
            .PersistKeysToFileSystem(new DirectoryInfo(dataProtectionKeysPath))
            .SetApplicationName("vws-portal-gateway");

        builder.Services.Configure<GatewayBackendOptions>(options =>
        {
            options.DesignerBaseUrl =
                builder.Configuration[
                    "ReverseProxy:Clusters:aas-designer-cluster:Destinations:destination1:Address"
                ]
                ?? throw new InvalidOperationException(
                    "Missing aas-designer cluster destination address."
                );
        });

        builder.Services.Configure<ForwardedHeadersOptions>(options =>
        {
            options.ForwardedHeaders =
                ForwardedHeaders.XForwardedFor
                | ForwardedHeaders.XForwardedProto
                | ForwardedHeaders.XForwardedHost;
            options.KnownIPNetworks.Clear();
            options.KnownProxies.Clear();
        });

        ConfigureSessionStore(builder.Services, builder.Configuration);
        builder.Services.AddHttpContextAccessor();
        builder.Services.AddAntiforgery(options =>
        {
            options.Cookie.Name = "vws-csrf";
            options.Cookie.HttpOnly = false;
            options.Cookie.IsEssential = true;
            options.Cookie.SameSite = SameSiteMode.Lax;
            options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
            options.HeaderName = "X-CSRF-TOKEN";
        });
        builder.Services.AddSession(options =>
        {
            options.Cookie.Name = "vws-bff";
            options.Cookie.HttpOnly = true;
            options.Cookie.IsEssential = true;
            options.Cookie.SameSite = SameSiteMode.Lax;
            options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
            options.IdleTimeout = TimeSpan.FromHours(8);
        });

        builder.Services.AddHttpClient<GatewayBffSessionService>();
        builder.Services.AddSingleton<GatewayBffSessionService>();

        // Add Yarp Reverse Proxy
        builder
            .Services.AddReverseProxy()
            .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

        // Add CORS
        builder.Services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy =>
            {
                policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
            });
        });

        // Add Health Checks
        builder.Services.AddHealthChecks();

        // Add OpenAPI support (native .NET 10)
        builder.Services.AddEndpointsApiExplorer();
    }

    private static void ConfigureSessionStore(
        IServiceCollection services,
        IConfiguration configuration
    )
    {
        var postgresConnectionString = configuration["Session:Postgres:ConnectionString"];
        if (!string.IsNullOrWhiteSpace(postgresConnectionString))
        {
            services.AddDistributedPostgresCache(options =>
            {
                options.ConnectionString = postgresConnectionString;
                options.SchemaName = configuration["Session:Postgres:SchemaName"] ?? "public";
                options.TableName =
                    configuration["Session:Postgres:TableName"] ?? "gateway_session_cache";
                options.CreateIfNotExists = configuration.GetValue(
                    "Session:Postgres:CreateIfNotExists",
                    true
                );
                options.UseWAL = configuration.GetValue("Session:Postgres:UseWAL", false);

                if (
                    TryGetTimeSpan(
                        configuration,
                        "Session:Postgres:ExpiredItemsDeletionInterval",
                        out var expiredItemsDeletionInterval
                    )
                )
                {
                    options.ExpiredItemsDeletionInterval = expiredItemsDeletionInterval;
                }

                if (
                    TryGetTimeSpan(
                        configuration,
                        "Session:Postgres:DefaultSlidingExpiration",
                        out var defaultSlidingExpiration
                    )
                )
                {
                    options.DefaultSlidingExpiration = defaultSlidingExpiration;
                }
            });
            return;
        }

        services.AddDistributedMemoryCache();
    }

    private static bool TryGetTimeSpan(IConfiguration configuration, string key, out TimeSpan value)
    {
        var rawValue = configuration[key];
        if (!string.IsNullOrWhiteSpace(rawValue) && TimeSpan.TryParse(rawValue, out value))
        {
            return true;
        }

        value = default;
        return false;
    }

    public static string GetDataProtectionKeysPath(
        IConfiguration configuration,
        IHostEnvironment environment
    )
    {
        var configuredPath = configuration["DataProtection:KeysPath"];
        if (!string.IsNullOrWhiteSpace(configuredPath))
        {
            return Path.GetFullPath(configuredPath);
        }

        if (environment.IsDevelopment())
        {
            return Path.GetFullPath(
                Path.Combine(environment.ContentRootPath, ".aspnet", "DataProtection-Keys")
            );
        }

        return "/var/lib/vws-gateway/keys";
    }

    public static void ConfigurePipeline(WebApplication app)
    {
        // Configure the HTTP request pipeline
        if (ShouldExposeOpenApi(app.Environment))
        {
            app.MapOpenApi();
        }

        app.UseForwardedHeaders();
        app.UseCors();
        app.UseSession();
        app.UseMiddleware<BffAntiforgeryMiddleware>();
        app.UseMiddleware<DownstreamAuthMiddleware>();

        // Disable HTTPS redirection in development to prevent 307 redirects that lose Authorization headers
        if (ShouldUseHttpsRedirection(app.Environment))
        {
            app.UseHttpsRedirection();
        }

        // Health check endpoints with JSON response
        app.MapHealthChecks(
            "/health",
            new HealthCheckOptions { ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse }
        );

        app.MapBffAuthEndpoints();

        // Map Yarp Reverse Proxy with CORS
        app.MapReverseProxy(proxyPipeline =>
        {
            proxyPipeline.UseCors();
        });
    }
}
