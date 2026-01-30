/**
 * Material You inspired theme - Educational & Minimalist
 * Inspired by Khan Academy, Google Classroom, Material Design 3
 */

import { Platform } from "react-native";

// Primary colors - Soft educational tones
const primaryLight = "#1A73E8"; // Google Blue
const primaryDark = "#8AB4F8";

export const Colors = {
  light: {
    text: "#1F1F1F",
    textSecondary: "#5F6368",
    background: "#FAFAFA",
    surface: "#FFFFFF",
    surfaceVariant: "#F1F3F4",
    tint: primaryLight,
    icon: "#5F6368",
    border: "#E8EAED",
    tabIconDefault: "#80868B",
    tabIconSelected: primaryLight,
    success: "#1E8E3E",
    error: "#D93025",
    warning: "#F9AB00",
  },
  dark: {
    text: "#E8EAED",
    textSecondary: "#9AA0A6",
    background: "#1F1F1F",
    surface: "#2D2D2D",
    surfaceVariant: "#3C4043",
    tint: primaryDark,
    icon: "#9AA0A6",
    border: "#3C4043",
    tabIconDefault: "#9AA0A6",
    tabIconSelected: primaryDark,
    success: "#81C995",
    error: "#F28B82",
    warning: "#FDD663",
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
