namespace DppExplorerBackendPlugin;

public sealed record DppExample(string Name, string Format, string Url);

/// <summary>
/// Fest hinterlegte Beispielpässe für die Auswahl im Plugin.
/// </summary>
public static class DppExamples
{
    public static readonly DppExample[] All =
    [
        new(
            "Demo-Tasse (Digitales Typenschild)",
            "AAS",
            "https://dpp.aas-suite.de/dpp/v1/dpps/https%3A%2F%2Fmeta-level.de%2Fids%2Faas%2F9500_8887_6835_2450"
        ),
        new(
            "Batteriepack 75 kWh",
            "UNTP",
            "https://untp.unece.org/artefacts/samples/v0.7.0/dpp/DigitalProductPassport_battery_instance.json"
        ),
        new(
            "LFP-Batteriezelle 100 Ah",
            "OpenDPP",
            "https://opendpp-node.eu/passport/demo-batteries-lfp-cell-200"
        ),
        new(
            "Textiljacke aus Bio-Baumwolle",
            "OpenDPP",
            "https://opendpp-node.eu/passport/demo-textiles-jacket-100"
        ),
        new(
            "Smart Eco Hub (Elektronik)",
            "OpenDPP",
            "https://opendpp-node.eu/passport/demo-electronics-eco-hub-300"
        ),
    ];
}
