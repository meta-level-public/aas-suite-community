import { definePreset } from '@primeuix/themes';
import { AasSuitePreset } from './aas-suite-theme';

export const EvergreenPreset = definePreset(AasSuitePreset, {
  semantic: {
    primary: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
      950: '#022c22',
    },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '#f6fdf9',
          100: '#ecfdf5',
          200: '#d1fae5',
          300: '#a7f3d0',
          400: '#6ee7b7',
          500: '#34d399',
          600: '#10b981',
          700: '#059669',
          800: '#047857',
          900: '#065f46',
          950: '#022c22',
        },
      },
      dark: {
        surface: {
          0: '#ffffff',
          50: '#edf8f2',
          100: '#d7efe2',
          200: '#b4dcc9',
          300: '#8ac2aa',
          400: '#5f9d84',
          500: '#44796a',
          600: '#335f53',
          700: '#294c42',
          800: '#203b33',
          900: '#182f28',
          950: '#0d1b17',
        },
      },
    },
  },
});