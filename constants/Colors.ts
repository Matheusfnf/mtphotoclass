/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#1A1B1E';
const backgroundColor = '#F4F6F8';
const primaryColor = '#00E676'; // Verde vibrante
const secondaryColor = '#1A1B1E'; // Preto suave
const accentColor = '#00E676'; // Verde para destaque

const Colors = {
  light: {
    text: '#1A1B1E',
    background: backgroundColor,
    tint: tintColorLight,
    tabIconDefault: '#9CA3AF',
    tabIconSelected: primaryColor,
    primary: primaryColor,
    secondary: secondaryColor,
    accent: accentColor,
    border: '#E5E7EB',
    cardBackground: '#FFFFFF',
    error: '#FF3B30',
    success: '#34C759',
    gray: {
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },
  dark: {
    text: '#FFFFFF',
    background: '#1A1B1E',
    tint: '#FFFFFF',
    tabIconDefault: '#6B7280',
    tabIconSelected: primaryColor,
    primary: primaryColor,
    secondary: '#374151',
    accent: primaryColor,
    border: '#374151',
    cardBackground: '#1F2937',
    error: '#FF453A',
    success: '#32D74B',
    gray: {
      100: '#374151',
      200: '#4B5563',
      300: '#6B7280',
      400: '#9CA3AF',
      500: '#D1D5DB',
      600: '#E5E7EB',
      700: '#F3F4F6',
      800: '#F9FAFB',
      900: '#FFFFFF',
    },
  },
};

export default Colors;
