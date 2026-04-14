import { AasSuitePreset } from './aas-suite-theme';
import { AmberPreset } from './amber-theme';
import { CobaltPreset } from './cobalt-theme';
import { EvergreenPreset } from './evergreen-theme';

const THEME_PRESET_BY_ID = {
  ml: AasSuitePreset,
  cobalt: CobaltPreset,
  evergreen: EvergreenPreset,
  amber: AmberPreset,
} as const;

export type ThemeId = keyof typeof THEME_PRESET_BY_ID;

export const AVAILABLE_THEME_IDS = Object.keys(THEME_PRESET_BY_ID) as ThemeId[];

export function normalizeThemeId(theme: string | null | undefined): ThemeId {
  const normalizedTheme = (theme ?? '').trim().toLowerCase();
  if (normalizedTheme in THEME_PRESET_BY_ID) {
    return normalizedTheme as ThemeId;
  }

  return 'ml';
}

export function resolveThemePreset(theme: string | null | undefined) {
  return THEME_PRESET_BY_ID[normalizeThemeId(theme)];
}
