'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeId = 'forest' | 'midnight' | 'aurora' | 'sunrise';

export interface ThemePalette {
  id: ThemeId;
  name: string;
  description: string;
  isDark: boolean;
  preview: [string, string, string];
  vars: Record<string, string>;
}

export const THEMES: ThemePalette[] = [
  // ── DARK THEMES ──────────────────────────────────────────────
  {
    id: 'forest',
    name: 'Forest',
    description: 'Black · Emerald Green · White',
    isDark: true,
    preview: ['#10b981', '#ffffff', '#0a0f0b'],
    vars: {
      '--background':                  'oklch(0.09 0.005 150)',
      '--foreground':                  'oklch(0.97 0.005 150)',
      '--card':                        'oklch(0.13 0.008 150)',
      '--card-foreground':             'oklch(0.97 0.005 150)',
      '--popover':                     'oklch(0.11 0.008 150)',
      '--popover-foreground':          'oklch(0.97 0.005 150)',
      '--primary':                     'oklch(0.62 0.20 152)',
      '--primary-foreground':          'oklch(0.05 0 0)',
      '--secondary':                   'oklch(0.20 0.04 152)',
      '--secondary-foreground':        'oklch(0.90 0.01 152)',
      '--muted':                       'oklch(0.18 0.008 150)',
      '--muted-foreground':            'oklch(0.60 0.01 150)',
      '--accent':                      'oklch(0.72 0.22 148)',
      '--accent-foreground':           'oklch(0.05 0 0)',
      '--destructive':                 'oklch(0.60 0.22 22)',
      '--destructive-foreground':      'oklch(0.97 0 0)',
      '--border':                      'oklch(0.22 0.015 150)',
      '--input':                       'oklch(0.16 0.010 150)',
      '--ring':                        'oklch(0.62 0.20 152)',
      '--sidebar':                     'oklch(0.07 0.006 150)',
      '--sidebar-foreground':          'oklch(0.92 0.008 150)',
      '--sidebar-primary':             'oklch(0.62 0.20 152)',
      '--sidebar-primary-foreground':  'oklch(0.05 0 0)',
      '--sidebar-accent':              'oklch(0.16 0.012 150)',
      '--sidebar-accent-foreground':   'oklch(0.90 0.005 150)',
      '--sidebar-border':              'oklch(0.18 0.012 150)',
      '--sidebar-ring':                'oklch(0.55 0.17 152)',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Deep Navy · Indigo · Violet',
    isDark: true,
    preview: ['#6366f1', '#a78bfa', '#0d0f1f'],
    vars: {
      '--background':                  'oklch(0.10 0.025 260)',
      '--foreground':                  'oklch(0.95 0.01 260)',
      '--card':                        'oklch(0.14 0.025 260)',
      '--card-foreground':             'oklch(0.95 0.01 260)',
      '--popover':                     'oklch(0.12 0.025 260)',
      '--popover-foreground':          'oklch(0.95 0.01 260)',
      '--primary':                     'oklch(0.62 0.22 264)',
      '--primary-foreground':          'oklch(0.985 0 0)',
      '--secondary':                   'oklch(0.65 0.20 300)',
      '--secondary-foreground':        'oklch(0.985 0 0)',
      '--muted':                       'oklch(0.20 0.025 260)',
      '--muted-foreground':            'oklch(0.62 0.02 260)',
      '--accent':                      'oklch(0.68 0.20 300)',
      '--accent-foreground':           'oklch(0.985 0 0)',
      '--destructive':                 'oklch(0.60 0.22 22)',
      '--destructive-foreground':      'oklch(0.985 0 0)',
      '--border':                      'oklch(0.22 0.025 260)',
      '--input':                       'oklch(0.18 0.020 260)',
      '--ring':                        'oklch(0.62 0.22 264)',
      '--sidebar':                     'oklch(0.08 0.028 262)',
      '--sidebar-foreground':          'oklch(0.92 0.01 260)',
      '--sidebar-primary':             'oklch(0.62 0.22 264)',
      '--sidebar-primary-foreground':  'oklch(0.985 0 0)',
      '--sidebar-accent':              'oklch(0.18 0.025 260)',
      '--sidebar-accent-foreground':   'oklch(0.90 0.01 260)',
      '--sidebar-border':              'oklch(0.20 0.025 260)',
      '--sidebar-ring':                'oklch(0.55 0.18 264)',
    },
  },

  // ── LIGHT THEMES ─────────────────────────────────────────────
  {
    id: 'aurora',
    name: 'Aurora',
    description: 'White · Teal · Deep Blue-Grey',
    isDark: false,
    preview: ['#0d9488', '#f0fdfa', '#0f172a'],
    vars: {
      '--background':                  'oklch(0.97 0.008 200)',
      '--foreground':                  'oklch(0.14 0.020 215)',
      '--card':                        'oklch(1.00 0.000 0)',
      '--card-foreground':             'oklch(0.14 0.020 215)',
      '--popover':                     'oklch(0.99 0.005 200)',
      '--popover-foreground':          'oklch(0.14 0.020 215)',
      '--primary':                     'oklch(0.50 0.18 195)',
      '--primary-foreground':          'oklch(0.99 0 0)',
      '--secondary':                   'oklch(0.90 0.025 195)',
      '--secondary-foreground':        'oklch(0.20 0.020 215)',
      '--muted':                       'oklch(0.93 0.010 200)',
      '--muted-foreground':            'oklch(0.45 0.012 210)',
      '--accent':                      'oklch(0.55 0.18 180)',
      '--accent-foreground':           'oklch(0.99 0 0)',
      '--destructive':                 'oklch(0.55 0.22 22)',
      '--destructive-foreground':      'oklch(0.99 0 0)',
      '--border':                      'oklch(0.84 0.015 200)',
      '--input':                       'oklch(0.92 0.010 200)',
      '--ring':                        'oklch(0.50 0.18 195)',
      '--sidebar':                     'oklch(0.93 0.018 200)',
      '--sidebar-foreground':          'oklch(0.18 0.020 215)',
      '--sidebar-primary':             'oklch(0.50 0.18 195)',
      '--sidebar-primary-foreground':  'oklch(0.99 0 0)',
      '--sidebar-accent':              'oklch(0.88 0.020 200)',
      '--sidebar-accent-foreground':   'oklch(0.20 0.020 215)',
      '--sidebar-border':              'oklch(0.82 0.015 200)',
      '--sidebar-ring':                'oklch(0.50 0.18 195)',
    },
  },
  {
    id: 'sunrise',
    name: 'Sunrise',
    description: 'White · Warm Coral · Charcoal',
    isDark: false,
    preview: ['#f97316', '#fff7ed', '#1c1917'],
    vars: {
      '--background':                  'oklch(0.98 0.010 55)',
      '--foreground':                  'oklch(0.14 0.015 45)',
      '--card':                        'oklch(1.00 0.000 0)',
      '--card-foreground':             'oklch(0.14 0.015 45)',
      '--popover':                     'oklch(0.99 0.006 55)',
      '--popover-foreground':          'oklch(0.14 0.015 45)',
      '--primary':                     'oklch(0.58 0.22 40)',
      '--primary-foreground':          'oklch(0.99 0 0)',
      '--secondary':                   'oklch(0.90 0.025 50)',
      '--secondary-foreground':        'oklch(0.20 0.015 45)',
      '--muted':                       'oklch(0.93 0.012 55)',
      '--muted-foreground':            'oklch(0.46 0.010 50)',
      '--accent':                      'oklch(0.62 0.20 25)',
      '--accent-foreground':           'oklch(0.99 0 0)',
      '--destructive':                 'oklch(0.55 0.22 22)',
      '--destructive-foreground':      'oklch(0.99 0 0)',
      '--border':                      'oklch(0.85 0.018 55)',
      '--input':                       'oklch(0.92 0.012 55)',
      '--ring':                        'oklch(0.58 0.22 40)',
      '--sidebar':                     'oklch(0.94 0.018 50)',
      '--sidebar-foreground':          'oklch(0.18 0.015 45)',
      '--sidebar-primary':             'oklch(0.58 0.22 40)',
      '--sidebar-primary-foreground':  'oklch(0.99 0 0)',
      '--sidebar-accent':              'oklch(0.88 0.020 50)',
      '--sidebar-accent-foreground':   'oklch(0.20 0.015 45)',
      '--sidebar-border':              'oklch(0.83 0.018 50)',
      '--sidebar-ring':                'oklch(0.58 0.22 40)',
    },
  },
];

interface ThemeState {
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeId: 'forest',
      setTheme: (id) => set({ themeId: id }),
    }),
    { name: 'jansetu-theme' }
  )
);
