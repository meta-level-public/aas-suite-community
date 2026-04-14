using AasDesignerApi.Model;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace AasDesignerApi;

internal static class AasSuiteContextOptionsFactory
{
    public static DbContextOptions<AasSuiteContext> CreateForCurrentEnvironment()
    {
        var configuration = BuildConfiguration();
        var connectionString = configuration.GetConnectionString("PgDatabase");
        return CreateForConnectionString(connectionString);
    }

    public static DbContextOptions<AasSuiteContext> CreateForConnectionString(
        string? connectionString
    )
    {
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "ConnectionStrings:PgDatabase ist nicht konfiguriert."
            );
        }

        var optionsBuilder = new DbContextOptionsBuilder<AasSuiteContext>();
        optionsBuilder.UseNpgsql(
            connectionString,
            x => x.MigrationsAssembly(AasDesignerBootstrap.MigrationsAssemblyName)
        );
        optionsBuilder.EnableSensitiveDataLogging();
        optionsBuilder.EnableDetailedErrors();
        return optionsBuilder.Options;
    }

    private static IConfiguration BuildConfiguration()
    {
        var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        var normalizedEnvironment = string.IsNullOrWhiteSpace(env) ? "Development" : env;
        var basePath = ResolveConfigurationBasePath();

        return new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile($"appsettings.{normalizedEnvironment}.json", optional: true)
            .AddEnvironmentVariables()
            .Build();
    }

    private static string ResolveConfigurationBasePath()
    {
        if (File.Exists(Path.Combine(AppContext.BaseDirectory, "appsettings.json")))
        {
            return AppContext.BaseDirectory;
        }

        if (File.Exists(Path.Combine(Directory.GetCurrentDirectory(), "appsettings.json")))
        {
            return Directory.GetCurrentDirectory();
        }

        return Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../../"));
    }
}
