using System.Text.Json;

namespace DppExplorerBackendPlugin;

public sealed record DppSource(string Name, string Host, string ExampleUrl);

public sealed class DppSourceStore
{
    private static readonly DppSource[] Defaults =
    [
        new(
            "UNTP Batteriebeispiel",
            "untp.unece.org",
            "https://untp.unece.org/artefacts/samples/v0.7.0/dpp/DigitalProductPassport_battery_instance.json"
        ),
    ];

    private readonly SemaphoreSlim gate = new(1, 1);
    private readonly string path =
        Environment.GetEnvironmentVariable("DPP_EXPLORER_CONFIG_PATH")
        ?? Path.Combine(AppContext.BaseDirectory, "dpp-explorer", "sources.json");

    public async Task<DppSource[]> ReadAsync(CancellationToken cancellationToken)
    {
        await gate.WaitAsync(cancellationToken);
        try
        {
            if (!File.Exists(path))
                return Defaults;
            await using var stream = File.OpenRead(path);
            return await JsonSerializer.DeserializeAsync<DppSource[]>(
                    stream,
                    cancellationToken: cancellationToken
                ) ?? [];
        }
        finally
        {
            gate.Release();
        }
    }

    public async Task WriteAsync(DppSource[] sources, CancellationToken cancellationToken)
    {
        await gate.WaitAsync(cancellationToken);
        try
        {
            Directory.CreateDirectory(Path.GetDirectoryName(path)!);
            var temporaryPath = path + ".tmp";
            await using (var stream = File.Create(temporaryPath))
                await JsonSerializer.SerializeAsync(
                    stream,
                    sources,
                    cancellationToken: cancellationToken
                );
            File.Move(temporaryPath, path, true);
        }
        finally
        {
            gate.Release();
        }
    }

    public static string? Validate(DppSource[]? sources)
    {
        if (sources == null || sources.Length > 30)
            return "Maximal 30 zusaetzliche Hosts sind erlaubt.";
        foreach (var source in sources)
        {
            if (source is null)
                return "Ein freigegebener Host ist ungueltig.";
            if (string.IsNullOrWhiteSpace(source.Name) || source.Name.Length > 100)
                return "Jeder Host braucht einen Namen mit maximal 100 Zeichen.";
            if (
                string.IsNullOrWhiteSpace(source.Host)
                || source.Host.Length > 253
                || source.Host.Contains('/')
                || source.Host.Contains(':')
                || source.Host.Contains('@')
                || !source.Host.Contains('.')
                || source.Host.EndsWith(".local", StringComparison.OrdinalIgnoreCase)
                || source.Host.EndsWith(".internal", StringComparison.OrdinalIgnoreCase)
                || !Uri.CheckHostName(source.Host).Equals(UriHostNameType.Dns)
            )
                return "Jeder Eintrag braucht einen gueltigen DNS-Hostnamen.";
            if (
                !Uri.TryCreate(source.ExampleUrl, UriKind.Absolute, out var example)
                || example.Scheme != Uri.UriSchemeHttps
                || !string.Equals(example.IdnHost, source.Host, StringComparison.OrdinalIgnoreCase)
                || example.Port != 443
                || !string.IsNullOrEmpty(example.UserInfo)
                || !string.IsNullOrEmpty(example.Fragment)
            )
                return "Die Beispiel-URL muss HTTPS verwenden und zum Host passen.";
        }
        return null;
    }
}
