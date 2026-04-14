import { definePreset } from '@primeuix/themes';
import { AasSuitePreset } from './aas-suite-theme';

export const AmberPreset = definePreset(AasSuitePreset, {
  semantic: {
    primary: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03',
    },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '#fffcf2',
          100: '#fffbeb',
          200: '#fef3c7',
          300: '#fde68a',
          400: '#fcd34d',
          500: '#fbbf24',
          600: '#f59e0b',
          700: '#d97706',
          800: '#b45309',
          900: '#92400e',
          950: '#451a03',
        },
      },
      dark: {
        surface: {
          0: '#ffffff',
          50: '#fff7e6',
          100: '#fdeac2',
          200: '#f6d58f',
          300: '#ebba58',
          400: '#d99626',
          500: '#b87717',
          600: '#915d13',
          700: '#71490f',
          800: '#5a3a0d',
          900: '#492f0c',
          950: '#2c1c07',
        },
      },
    },
  },
});