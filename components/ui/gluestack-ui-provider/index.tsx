import React, { useLayoutEffect, useState } from 'react';
import { View, ViewProps } from 'react-native';
import { OverlayProvider } from '@gluestack-ui/core/overlay/creator';
import { ToastProvider } from '@gluestack-ui/core/toast/creator';
import {
  useGluestackColors as useGluestackColorsHook,
  useCalendarTheme as useCalendarThemeHook,
} from './useGluestackColors';

export type ModeType = 'light' | 'dark' | 'system';

// Re-export color hooks
export const useGluestackColors = useGluestackColorsHook;
export const useCalendarTheme = useCalendarThemeHook;
export type { GluestackColors } from './useGluestackColors';

export function GluestackUIProvider({
  mode: _mode = 'light',
  ...props
}: {
  mode?: ModeType;
  children?: React.ReactNode;
  style?: ViewProps['style'];
}) {
  const [themeVars, setThemeVars] = useState<Record<string, string>>({});

  useLayoutEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const rootStyles = window.getComputedStyle(document.documentElement);
    const nextThemeVars: Record<string, string> = {};

    for (let index = 0; index < rootStyles.length; index += 1) {
      const propertyName = rootStyles.item(index);
      if (propertyName?.startsWith('--')) {
        nextThemeVars[propertyName] = rootStyles.getPropertyValue(propertyName).trim();
      }
    }

    setThemeVars(nextThemeVars);
  }, []);

  return (
    <View
      style={[
        themeVars as React.CSSProperties,
        { flex: 1, height: '100%', width: '100%' },
        props.style,
      ]}
    >
      <OverlayProvider>
        <ToastProvider>{props.children}</ToastProvider>
      </OverlayProvider>
    </View>
  );
}
