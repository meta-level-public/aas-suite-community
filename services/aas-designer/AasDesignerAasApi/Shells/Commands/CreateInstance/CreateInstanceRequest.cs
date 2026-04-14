namespace AasDesignerAasApi.Shells.Commands.CreateInstance;

public class CreateInstanceRequest
{
    public required string AasIdentifier { get; set; }
    public required string SerialNumber { get; set; }
    public required string DateOfManufacture { get; set; }
}
