namespace AasDesignerAasApi.Shells.Queries;

public class ShellListVm
{
    public string? Cursor { get; set; }
    public List<ShellListDto> Shells { get; set; } = [];
}
