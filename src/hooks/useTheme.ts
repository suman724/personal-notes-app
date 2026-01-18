import { useEffect, useMemo, useState } from 'react';

const THEME_STORAGE_KEY = 'personal-notes-theme';

const THEME_OPTIONS = [
  { id: 'dawn', label: 'Dawn', swatch: { accent: '#c0582a', soft: '#f1c7a9' } },
  { id: 'sage', label: 'Sage', swatch: { accent: '#2f7f5e', soft: '#c7e4d5' } },
  { id: 'cobalt', label: 'Cobalt', swatch: { accent: '#2a5fa8', soft: '#c6d8f1' } },
  { id: 'clay', label: 'Clay', swatch: { accent: '#b05a47', soft: '#f0cbb8' } },
] as const;

type ThemeId = (typeof THEME_OPTIONS)[number]['id'];

type ThemeOption = {
  id: ThemeId;
  label: string;
  swatch: {
    accent: string;
    soft: string;
  };
};

function isThemeId(value: string | null): value is ThemeId {
  return THEME_OPTIONS.some((option) => option.id === value);
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeId>(() => {
    if (typeof window === 'undefined') {
      return 'dawn';
    }

    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeId(stored) ? stored : 'dawn';
  });

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.dataset.theme = theme;

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      return;
    }
  }, [theme]);

  const themes = useMemo<ThemeOption[]>(() => [...THEME_OPTIONS], []);

  return {
    theme,
    setTheme,
    themes,
  };
}
