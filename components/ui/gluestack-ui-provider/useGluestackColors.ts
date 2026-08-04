import { useEffect, useState } from 'react';

/**
 * Convert CSS variable name to camelCase
 * Example: '--primary-foreground' -> 'primaryForeground'
 */
function toCamelCase(str: string): string {
  return str
    .replace(/^--/, '') // Remove leading --
    .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()); // Convert -x to X
}

/**
 * Normalize a CSS color value to hex so hooks return a consistent format.
 */
function normalizeToHex(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '#000000';
  if (trimmed.startsWith('#')) return trimmed;

  const rgbMatch = trimmed.match(/^(\d+)\s+(\d+)\s+(\d+)$/);
  if (!rgbMatch) return trimmed;

  const [, r, g, b] = rgbMatch;
  const toHex = (n: string) =>
    Math.max(0, Math.min(255, Number.parseInt(n, 10))).toString(16).padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Hook to get all gluestack colors as hex values
 * Automatically converts all CSS variables to camelCase
 * Returns a dynamic object with all colors
 *
 * Usage: const colors = useGluestackColors();
 *          colors.primary -> '#171717'
 *          colors.primaryForeground -> '#fafafa'
 *          colors.forest -> '#228b22' (if you add --forest to config)
 */
export function useGluestackColors(): Record<string, string> {
  const [theme, setTheme] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const rootStyles = window.getComputedStyle(document.documentElement);
    const nextTheme: Record<string, string> = {};

    for (let index = 0; index < rootStyles.length; index += 1) {
      const propertyName = rootStyles.item(index);
      if (propertyName?.startsWith('--')) {
        const colorValue = rootStyles.getPropertyValue(propertyName).trim();
        if (colorValue) {
          nextTheme[toCamelCase(propertyName)] = normalizeToHex(colorValue);
        }
      }
    }

    setTheme(nextTheme);
  }, []);

  return theme;
}

/**
 * Hook to get calendar theme object for react-native-calendars
 * Automatically maps all available colors
 */
export function useCalendarTheme(): Record<string, string> {
  const palette = useGluestackColors();

  return {
    backgroundColor: palette.background || '#ffffff',
    calendarBackground: palette.background || '#ffffff',
    textSectionTitleColor: palette.mutedForeground || '#737373',
    selectedDayBackgroundColor: palette.primary || '#171717',
    selectedDayTextColor: palette.primaryForeground || '#fafafa',
    todayTextColor: palette.primary || '#171717',
    todayBackgroundColor: palette.accent || '#f7f7f7',
    dayTextColor: palette.foreground || '#0a0a0a',
    textDisabledColor: palette.mutedForeground || '#737373',
    dotColor: palette.primary || '#171717',
    selectedDotColor: palette.primaryForeground || '#fafafa',
    arrowColor: palette.foreground || '#0a0a0a',
    monthTextColor: palette.foreground || '#0a0a0a',
    indicatorColor: palette.primary || '#171717',
  };
}

// Type helper - you can use this to get typed colors if needed
export type GluestackColors = ReturnType<typeof useGluestackColors>;
