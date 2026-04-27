using AasDesignerApi.Middleware;
using AasDesignerApi.Model;
using AasDesignerApi.Model.Configuration;
using AasDesignerModel;
using AasShared.Configuration;
using AasShared.Middleware;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Logging;

namespace AasDesignerApi;

public static class AasDesignerBootstrap
{
    public const string MigrationsAssemblyName = "AasDesignerApi.Host";
    public const string ProxyClientHandlerCategory =
        "System.Net.Http.HttpClient.AspNetCore.Proxy.HttpProxyClient.ClientHandler";
    public const string ProxyLogicalHandlerCategory =
        "System.Net.Http.HttpClient.AspNetCore.Proxy.HttpProxyClient.LogicalHandler";

    public static void ConfigureDatabase(
        IServiceCollection services,
        IConfiguration configuration,
        IHostEnvironment environment
    )
    {
        var connectionString = configuration.GetConnectionString("PgDatabase");
        services.AddDbContext<AasSuiteContext>(options =>
        {
            options.UseNpgsql(connectionString, x => x.MigrationsAssembly(MigrationsAssemblyName));
            options.EnableSensitiveDataLogging();
            options.EnableDetailedErrors();
            if (ShouldIgnorePendingModelChangesWarning(environment))
            {
                options.ConfigureWarnings(warnings =>
                {
                    warnings.Ignore(
                        Microsoft
                            .EntityFrameworkCore
                            .Diagnostics
                            .RelationalEventId
                            .PendingModelChangesWarning
                    );
                });
            }
        });
        services.AddScoped<IApplicationDbContext>(provider =>
            provider.GetRequiredService<AasSuiteContext>()
        );
    }

    public static bool ShouldIgnorePendingModelChangesWarning(IHostEnvironment environment)
    {
        return true;
    }

    public static TConfig GetRequiredConfiguration<TConfig>(
        IConfiguration configuration,
        string sectionName
    )
        where TConfig : class
    {
        return configuration.GetSection(sectionName).Get<TConfig>()
            ?? throw new Exception($"{sectionName} not found");
    }

    public static void RegisterOptionalSingleton<TConfig>(
        IServiceCollection services,
        IConfiguration configuration,
        string sectionName
    )
        where TConfig : class
    {
        var value = configuration.GetSection(sectionName).Get<TConfig>();
        if (value != null)
        {
            services.AddSingleton(value);
        }
    }

    public static void RegisterRequiredSingleton<TConfig>(
        IServiceCollection services,
        IConfiguration configuration,
        string sectionName
    )
        where TConfig : class
    {
        services.AddSingleton(GetRequiredConfiguration<TConfig>(configuration, sectionName));
    }

    public static void ConfigureCoreWebServices(IServiceCollection services)
    {
        services
            .AddControllers(configure =>
            {
                configure.Filters.Add<SerializationFilter>();
            })
            .AddNewtonsoftJson();

        services.AddResponseCompression();
        services.AddHealthChecks().AddDbContextCheck<AasSuiteContext>();
        services.AddHttpContextAccessor();
        services.AddHttpClient();
    }

    public static void ConfigureLogging(ILoggingBuilder logging)
    {
        logging.AddLog4Net();
        logging.AddFilter(ProxyClientHandlerCategory, LogLevel.Error);
        logging.AddFilter(ProxyLogicalHandlerCategory, LogLevel.Error);
    }
}
