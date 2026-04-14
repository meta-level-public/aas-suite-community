using System.IO;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace AasShared.Configuration;

public static class ConfigurationSetup
{
    public static string ResolveAppSettingsBasePath(string contentRootPath)
    {
        var localAppSettingsPath = Path.Combine(contentRootPath, "appsettings.json");
        if (File.Exists(localAppSettingsPath))
        {
            return contentRootPath;
        }

        var sharedDesignerBasePath = Path.GetFullPath(
            Path.Combine(contentRootPath, "..", "AasDesignerApi")
        );
        if (File.Exists(Path.Combine(sharedDesignerBasePath, "appsettings.json")))
        {
            return sharedDesignerBasePath;
        }

        return contentRootPath;
    }

    public static IHostBuilder ConfigureAppSettings(this IHostBuilder host)
    {
        host.ConfigureAppConfiguration(
            (ctx, builder) =>
            {
                var appSettingsBasePath = ResolveAppSettingsBasePath(
                    ctx.HostingEnvironment.ContentRootPath
                );
                var environment = ctx.HostingEnvironment.EnvironmentName;

                builder.AddJsonFile(
                    Path.Combine(appSettingsBasePath, "appsettings.json"),
                    false,
                    true
                );
                builder.AddJsonFile(
                    Path.Combine(appSettingsBasePath, $"appsettings.{environment}.json"),
                    true,
                    true
                );
                builder.AddEnvironmentVariables();
            }
        );

        return host;
    }
}
