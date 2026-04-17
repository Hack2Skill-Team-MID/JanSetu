'use client';

import { useEffect } from 'react';
import { useThemeStore, THEMES } from '../../store/theme-store';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeId = useThemeStore((s) => s.themeId);

  useEffect(() => {
    const palette = THEMES.find((t) => t.id === themeId) || THEMES[0];
    const html = document.documentElement;

    // Inject CSS variables
    Object.entries(palette.vars).forEach(([key, value]) => {
      html.style.setProperty(key, value);
    });

    // Toggle dark/light class so Tailwind dark: variants work
    if (palette.isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    html.setAttribute('data-theme', themeId);
  }, [themeId]);

  return <>{children}</>;
}
