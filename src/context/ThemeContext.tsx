import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeId = 'osaka-jade' | 'tactical-light' | 'midnight-hextech' | 'noxian-blood';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  tag: string;
  description: string;
  isDefault?: boolean;
  metaColor: string;
  swatches: {
    bg: string;
    surface: string;
    accent: string;
    text: string;
    highlight?: string;
  };
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'osaka-jade',
    name: 'Osaka Jade',
    tag: 'DEFAULT • OMARCHY SIGNATURE',
    description: 'Deep atmospheric dark jade (#111c18), warm cream typography (#c1c497), and radiant cyber-jade highlights (#2dd5b7). Specially crafted for tactical nighttime readability.',
    isDefault: true,
    metaColor: '#111c18',
    swatches: {
      bg: '#111c18',
      surface: '#162520',
      accent: '#2dd5b7',
      text: '#c1c497',
      highlight: '#e5c736'
    }
  },
  {
    id: 'tactical-light',
    name: 'Tactical Light',
    tag: 'ORIGINAL DEADLOCK HUD',
    description: 'Ultra-crisp high-contrast daylight mode featuring clean slate frames, snow white tactical canvases, and vivid emerald accents.',
    metaColor: '#f8fafc',
    swatches: {
      bg: '#f8fafc',
      surface: '#ffffff',
      accent: '#059669',
      text: '#0f172a',
      highlight: '#10b981'
    }
  },
  {
    id: 'midnight-hextech',
    name: 'Midnight Hextech',
    tag: 'PILTOVER CYBER NOCTURNE',
    description: 'Abyssal navy-indigo obsidian (#0b0f19) illuminated by glowing Hextech blue mana conduits and kinetic amber accents.',
    metaColor: '#0b0f19',
    swatches: {
      bg: '#0b0f19',
      surface: '#111827',
      accent: '#38bdf8',
      text: '#f1f5f9',
      highlight: '#f59e0b'
    }
  },
  {
    id: 'noxian-blood',
    name: 'Noxian Blood',
    tag: 'ABYSSAL CRIMSON DARK',
    description: 'Stealth obsidian-burgundy palette (#0f0a0c) punctuated by lethal blood-crimson borders and pale silver-rose gothic text.',
    metaColor: '#0f0a0c',
    swatches: {
      bg: '#0f0a0c',
      surface: '#1c1215',
      accent: '#f43f5e',
      text: '#fce7f3',
      highlight: '#fda4af'
    }
  }
];

interface ThemeContextType {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  themes: ThemeOption[];
  isThemeModalOpen: boolean;
  setIsThemeModalOpen: (open: boolean) => void;
  currentThemeConfig: ThemeOption;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'hexcards_theme';
export const DEFAULT_THEME: ThemeId = 'osaka-jade';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    if (typeof window === 'undefined') return DEFAULT_THEME;
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null;
      if (saved && THEME_OPTIONS.some((t) => t.id === saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    return DEFAULT_THEME;
  });

  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);

  const setTheme = (newTheme: ThemeId) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Apply data-theme attribute on root document
    document.documentElement.setAttribute('data-theme', theme);

    // Synchronize HTML theme-color meta tag for browser UI
    const config = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];
    let metaTag = document.querySelector('meta[name="theme-color"]');
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', 'theme-color');
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', config.metaColor);
  }, [theme]);

  const currentThemeConfig = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        themes: THEME_OPTIONS,
        isThemeModalOpen,
        setIsThemeModalOpen,
        currentThemeConfig
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
