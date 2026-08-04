import { vars } from 'nativewind';

// Shared color values kept in sync with globals.css so the provider can
// resolve the same theme tokens without switching on hydration.
export const colors = {
  light: {
    '--primary': '#10b981',
    '--primary-foreground': '#ffffff',
    '--card': '#ffffff',
    '--secondary': '#f1f5f9',
    '--secondary-foreground': '#0f172a',
    '--background': '#f8fafc',
    '--popover': '#ffffff',
    '--popover-foreground': '#0f172a',
    '--muted': '#f1f5f9',
    '--muted-foreground': '#64748b',
    '--destructive': '#ef4444',
    '--foreground': '#0f172a',
    '--border': '#e2e8f0',
    '--input': '#e2e8f0',
    '--ring': '#10b981',
    '--accent': '#f1f5f9',
    '--accent-foreground': '#0f172a',
  },
  dark: {
    '--primary': '#10b981',
    '--primary-foreground': '#ffffff',
    '--card': '#0f172a',
    '--secondary': '#1e293b',
    '--secondary-foreground': '#f8fafc',
    '--background': '#0a0a0a',
    '--popover': '#0f172a',
    '--popover-foreground': '#f8fafc',
    '--muted': '#1e293b',
    '--muted-foreground': '#94a3b8',
    '--destructive': '#ef4444',
    '--foreground': '#f8fafc',
    '--border': '#334155',
    '--input': '#334155',
    '--ring': '#34d399',
    '--accent': '#1e293b',
    '--accent-foreground': '#f8fafc',
  },
};

// Config for nativewind vars() - used by provider
export const config = {
  light: vars(colors.light),
  dark: vars(colors.dark),
};
