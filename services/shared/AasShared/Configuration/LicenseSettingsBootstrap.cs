using Microsoft.Extensions.Hosting;

namespace AasShared.Configuration;

public static class LicenseSettingsBootstrap
{
    public static void Normalize(
        AppSettings appSettings,
        IHostEnvironment environment,
        string contentRootPath
    )
    {
        appSettings.LicenseFilePath = ResolveAbsolutePath(
            contentRootPath,
            appSettings.LicenseFilePath
        );
        appSettings.LicensePublicKeyPath = ResolveAbsolutePath(
            contentRootPath,
            appSettings.LicensePublicKeyPath
        );

        if (!environment.IsDevelopment())
        {
            return;
        }

        if (File.Exists(appSettings.LicenseFilePath))
        {
            return;
        }

        if (
            !string.Equals(
                Path.GetFileName(appSettings.LicenseFilePath),
                "license-Demo-Designer.json",
                StringComparison.OrdinalIgnoreCase
            )
        )
        {
            return;
        }

        var licenseDirectory = Path.GetDirectoryName(appSettings.LicenseFilePath);
        if (string.IsNullOrWhiteSpace(licenseDirectory))
        {
            return;
        }

        foreach (
            var candidatePath in new[]
            {
                Path.Combine(licenseDirectory, "license-Demo-Designer2.json"),
                Path.Combine(licenseDirectory, "license-Demo1-Designer.json"),
            }
        )
        {
            if (File.Exists(candidatePath))
            {
                appSettings.LicenseFilePath = candidatePath;
                return;
            }
        }
    }

    private static string ResolveAbsolutePath(string contentRootPath, string configuredPath)
    {
        if (string.IsNullOrWhiteSpace(configuredPath))
        {
            return configuredPath;
        }

        return Path.IsPathRooted(configuredPath)
            ? configuredPath
            : Path.GetFullPath(Path.Combine(contentRootPath, configuredPath));
    }
}
