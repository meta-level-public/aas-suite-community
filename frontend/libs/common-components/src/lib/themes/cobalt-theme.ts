import { definePreset } from '@primeuix/themes';
import { AasSuitePreset } from './aas-suite-theme';

export const CobaltPreset = definePreset(AasSuitePreset, {
  semantic: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '#f8fbff',
          100: '#eff6ff',
          200: '#dbeafe',
          300: '#bfd8fb',
          400: '#93c5fd',
          500: '#60a5fa',
          600: '#3b82f6',
          700: '#2563eb',
          800: '#1d4ed8',
          900: '#1e3a8a',
          950: '#172554',
        },
      },
      dark: {
        surface: {
          0: '#ffffff',
          50: '#eff4ff',
          100: '#dbe7ff',
          200: '#bfd2fb',
          300: '#93b4f5',
          400: '#638fe6',
          500: '#456cc4',
          600: '#33539a',
          700: '#284175',
          800: '#22345d',
          900: '#1b2949',
          950: '#111a2e',
        },
      },
    },
  },
});