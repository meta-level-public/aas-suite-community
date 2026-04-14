export interface ThemeDefinition {
  key: string;
  displayName: string;
  baseTheme: string;
  customCss: string;
  darkCustomCss: string;
  customerLogoUrl: string;
  backgroundImageUrl: string;
  darkBackgroundImageUrl: string;
  backgroundColor: string;
  darkBackgroundColor: string;
  backgroundMode: 'color' | 'image';
  darkBackgroundMode: 'color' | 'image';
  fontFamily: string;
  darkFontFamily: string;
  baseFontSize: string;
  darkBaseFontSize: string;
  primaryColor: string;
  darkPrimaryColor: string;
  highlightColor: string;
  darkHighlightColor: string;
  highlightTextColor: string;
  darkHighlightTextColor: string;
  primaryHoverColor: string;
  darkPrimaryHoverColor: string;
  surfaceColor: string;
  darkSurfaceColor: string;
  textColor: string;
  darkTextColor: string;
  inputTextColor: string;
  darkInputTextColor: string;
  primaryOpacity: string;
  darkPrimaryOpacity: string;
  surfaceOpacity: string;
  darkSurfaceOpacity: string;
  textOpacity: string;
  darkTextOpacity: string;
  borderRadius: string;
  darkBorderRadius: string;
  darkInheritFromLight: boolean;
  isBuiltIn: boolean;
}

export interface ThemeDefinitionsImport {
  fileAsBase64: string;
}
