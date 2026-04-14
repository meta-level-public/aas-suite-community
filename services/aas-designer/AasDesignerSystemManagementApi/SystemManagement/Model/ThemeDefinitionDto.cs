namespace AasDesignerSystemManagementApi.SystemManagement.Model;

public class ThemeDefinitionDto
{
    public string Key { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string BaseTheme { get; set; } = string.Empty;
    public string CustomCss { get; set; } = string.Empty;
    public string DarkCustomCss { get; set; } = string.Empty;
    public string CustomerLogoUrl { get; set; } = string.Empty;
    public string BackgroundImageUrl { get; set; } = string.Empty;
    public string DarkBackgroundImageUrl { get; set; } = string.Empty;
    public string BackgroundColor { get; set; } = string.Empty;
    public string DarkBackgroundColor { get; set; } = string.Empty;
    public string BackgroundMode { get; set; } = "image";
    public string DarkBackgroundMode { get; set; } = "image";
    public string FontFamily { get; set; } = string.Empty;
    public string DarkFontFamily { get; set; } = string.Empty;
    public string BaseFontSize { get; set; } = string.Empty;
    public string DarkBaseFontSize { get; set; } = string.Empty;
    public string PrimaryColor { get; set; } = string.Empty;
    public string DarkPrimaryColor { get; set; } = string.Empty;
    public string HighlightColor { get; set; } = string.Empty;
    public string DarkHighlightColor { get; set; } = string.Empty;
    public string HighlightTextColor { get; set; } = string.Empty;
    public string DarkHighlightTextColor { get; set; } = string.Empty;
    public string PrimaryHoverColor { get; set; } = string.Empty;
    public string DarkPrimaryHoverColor { get; set; } = string.Empty;
    public string SurfaceColor { get; set; } = string.Empty;
    public string DarkSurfaceColor { get; set; } = string.Empty;
    public string TextColor { get; set; } = string.Empty;
    public string DarkTextColor { get; set; } = string.Empty;
    public string InputTextColor { get; set; } = string.Empty;
    public string DarkInputTextColor { get; set; } = string.Empty;
    public string PrimaryOpacity { get; set; } = string.Empty;
    public string DarkPrimaryOpacity { get; set; } = string.Empty;
    public string SurfaceOpacity { get; set; } = string.Empty;
    public string DarkSurfaceOpacity { get; set; } = string.Empty;
    public string TextOpacity { get; set; } = string.Empty;
    public string DarkTextOpacity { get; set; } = string.Empty;
    public string BorderRadius { get; set; } = string.Empty;
    public string DarkBorderRadius { get; set; } = string.Empty;
    public bool DarkInheritFromLight { get; set; } = true;
    public bool IsBuiltIn { get; set; }
}
