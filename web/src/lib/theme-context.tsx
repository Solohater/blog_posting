"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export interface Theme {
  name: string;
  label: string;
  colors: Record<string, string>;
}

const themes: Theme[] = [
  {
    name: "light",
    label: "Light",
    colors: {
      "--background": "#f8fafc",
      "--foreground": "#0f172a",
      "--primary": "#2563eb",
      "--primary-hover": "#1d4ed8",
      "--muted": "#64748b",
      "--border": "#e2e8f0",
      "--card": "#ffffff",
      "--card-hover": "#f8fafc",
      "--success": "#16a34a",
      "--warning": "#d97706",
      "--danger": "#dc2626",
    },
  },
  {
    name: "dark",
    label: "Dark",
    colors: {
      "--background": "#0f172a",
      "--foreground": "#e2e8f0",
      "--primary": "#3b82f6",
      "--primary-hover": "#60a5fa",
      "--muted": "#94a3b8",
      "--border": "#1e293b",
      "--card": "#1e293b",
      "--card-hover": "#334155",
      "--success": "#22c55e",
      "--warning": "#f59e0b",
      "--danger": "#ef4444",
    },
  },
  {
    name: "forest",
    label: "Forest",
    colors: {
      "--background": "#f0fdf4",
      "--foreground": "#14532d",
      "--primary": "#16a34a",
      "--primary-hover": "#15803d",
      "--muted": "#6b7280",
      "--border": "#bbf7d0",
      "--card": "#ffffff",
      "--card-hover": "#f0fdf4",
      "--success": "#16a34a",
      "--warning": "#d97706",
      "--danger": "#dc2626",
    },
  },
  {
    name: "sunset",
    label: "Sunset",
    colors: {
      "--background": "#fff7ed",
      "--foreground": "#7c2d12",
      "--primary": "#ea580c",
      "--primary-hover": "#c2410c",
      "--muted": "#9a3412",
      "--border": "#fed7aa",
      "--card": "#ffffff",
      "--card-hover": "#fff7ed",
      "--success": "#16a34a",
      "--warning": "#d97706",
      "--danger": "#dc2626",
    },
  },
  {
    name: "ocean",
    label: "Ocean",
    colors: {
      "--background": "#f0fdfa",
      "--foreground": "#134e4a",
      "--primary": "#0d9488",
      "--primary-hover": "#0f766e",
      "--muted": "#6b7280",
      "--border": "#ccfbf1",
      "--card": "#ffffff",
      "--card-hover": "#f0fdfa",
      "--success": "#16a34a",
      "--warning": "#d97706",
      "--danger": "#dc2626",
    },
  },
  {
    name: "lavender",
    label: "Lavender",
    colors: {
      "--background": "#faf5ff",
      "--foreground": "#3b0764",
      "--primary": "#7c3aed",
      "--primary-hover": "#6d28d9",
      "--muted": "#6b7280",
      "--border": "#e9d5ff",
      "--card": "#ffffff",
      "--card-hover": "#faf5ff",
      "--success": "#16a34a",
      "--warning": "#d97706",
      "--danger": "#dc2626",
    },
  },
  {
    name: "rose",
    label: "Rose",
    colors: {
      "--background": "#fff1f2",
      "--foreground": "#881337",
      "--primary": "#e11d48",
      "--primary-hover": "#be123c",
      "--muted": "#9f1239",
      "--border": "#fecdd3",
      "--card": "#ffffff",
      "--card-hover": "#fff1f2",
      "--success": "#16a34a",
      "--warning": "#d97706",
      "--danger": "#dc2626",
    },
  },
  {
    name: "amber",
    label: "Amber",
    colors: {
      "--background": "#fffbeb",
      "--foreground": "#78350f",
      "--primary": "#d97706",
      "--primary-hover": "#b45309",
      "--muted": "#92400e",
      "--border": "#fde68a",
      "--card": "#ffffff",
      "--card-hover": "#fffbeb",
      "--success": "#16a34a",
      "--warning": "#d97706",
      "--danger": "#dc2626",
    },
  },
  {
    name: "emerald",
    label: "Emerald",
    colors: {
      "--background": "#ecfdf5",
      "--foreground": "#064e3b",
      "--primary": "#059669",
      "--primary-hover": "#047857",
      "--muted": "#6b7280",
      "--border": "#d1fae5",
      "--card": "#ffffff",
      "--card-hover": "#ecfdf5",
      "--success": "#16a34a",
      "--warning": "#d97706",
      "--danger": "#dc2626",
    },
  },
  {
    name: "sky",
    label: "Sky",
    colors: {
      "--background": "#f0f9ff",
      "--foreground": "#0c4a6e",
      "--primary": "#0284c7",
      "--primary-hover": "#0369a1",
      "--muted": "#6b7280",
      "--border": "#e0f2fe",
      "--card": "#ffffff",
      "--card-hover": "#f0f9ff",
      "--success": "#16a34a",
      "--warning": "#d97706",
      "--danger": "#dc2626",
    },
  },
  {
    name: "slate",
    label: "Slate",
    colors: {
      "--background": "#f8fafc",
      "--foreground": "#1e293b",
      "--primary": "#475569",
      "--primary-hover": "#334155",
      "--muted": "#94a3b8",
      "--border": "#e2e8f0",
      "--card": "#ffffff",
      "--card-hover": "#f8fafc",
      "--success": "#16a34a",
      "--warning": "#d97706",
      "--danger": "#dc2626",
    },
  },
  {
    name: "midnight",
    label: "Midnight",
    colors: {
      "--background": "#0f172a",
      "--foreground": "#cbd5e1",
      "--primary": "#6366f1",
      "--primary-hover": "#818cf8",
      "--muted": "#94a3b8",
      "--border": "#1e293b",
      "--card": "#1e293b",
      "--card-hover": "#334155",
      "--success": "#22c55e",
      "--warning": "#f59e0b",
      "--danger": "#ef4444",
    },
  },
];

interface ThemeContextType {
  theme: Theme;
  setTheme: (name: string) => void;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextType>({
  theme: themes[0],
  setTheme: () => {},
  themes,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(themes[0]);

  const applyTheme = useCallback((t: Theme) => {
    const root = document.documentElement;
    Object.entries(t.colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    setThemeState(t);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("blog-theme");
    if (saved) {
      const found = themes.find((t) => t.name === saved);
      if (found) applyTheme(found);
    }
  }, [applyTheme]);

  const setTheme = useCallback((name: string) => {
    const found = themes.find((t) => t.name === name);
    if (found) {
      applyTheme(found);
      localStorage.setItem("blog-theme", name);
    }
  }, [applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
