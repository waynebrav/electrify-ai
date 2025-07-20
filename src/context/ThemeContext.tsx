
import React, { createContext, useContext, useEffect, useState, useMemo } from "react";

type Theme = "light" | "dark" | "future" | "cyberpunk" | "system";
type ThemeMode = "light" | "dark" | "future" | "cyberpunk";

const prefersDarkTheme = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
};

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  systemTheme: "light" | "dark";
  accentColor: string;
  setAccentColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_COLORS = {
  light: {
    background: "white",
    foreground: "#1a1a1a",
  },
  dark: {
    background: "#131313",
    foreground: "#ffffff",
  },
  future: {
    background: "#070b1e",
    foreground: "#e2e8f0",
  },
  cyberpunk: {
    background: "#0f0e17",
    foreground: "#fffffe",
  },
};

const ACCENT_COLORS = {
  blue: "rgb(59, 130, 246)",
  purple: "rgb(139, 92, 246)",
  cyan: "rgb(34, 211, 238)",
  green: "rgb(16, 185, 129)",
  orange: "rgb(249, 115, 22)",
  pink: "rgb(236, 72, 153)"
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem("theme") as Theme;
    return savedTheme || "system";
  });

  const [accentColor, setAccentColorState] = useState<string>(() => {
    return localStorage.getItem("accentColor") || ACCENT_COLORS.blue;
  });

  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(
    prefersDarkTheme() ? "dark" : "light"
  );

  const themeMode: ThemeMode = useMemo(() => {
    if (theme === "system") {
      return systemTheme;
    }
    return theme;
  }, [theme, systemTheme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.remove("light", "dark", "future", "cyberpunk");
    document.documentElement.classList.add(themeMode);
    
    // Set CSS variables for accent color
    document.documentElement.style.setProperty("--accent-color", accentColor);
    document.documentElement.style.setProperty("--accent-color-hover", adjustColorBrightness(accentColor, -10));
    document.documentElement.style.setProperty("--accent-color-foreground", getContrastingColor(accentColor));
  }, [themeMode, accentColor]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const toggleTheme = () => {
    const themes: Theme[] = ["light", "dark", "future", "cyberpunk"];
    const currentIndex = themes.indexOf(theme === "system" ? systemTheme : theme as ThemeMode);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const setAccentColor = (color: string) => {
    setAccentColorState(color);
    localStorage.setItem("accentColor", color);
  };

  // Helper functions for color manipulation
  function adjustColorBrightness(color: string, amount: number): string {
    // Simple color brightness adjustment for RGB format
    if (color.startsWith('rgb')) {
      const rgbMatch = color.match(/\d+/g);
      if (rgbMatch && rgbMatch.length >= 3) {
        const r = Math.max(0, Math.min(255, parseInt(rgbMatch[0]) + amount));
        const g = Math.max(0, Math.min(255, parseInt(rgbMatch[1]) + amount));
        const b = Math.max(0, Math.min(255, parseInt(rgbMatch[2]) + amount));
        return `rgb(${r}, ${g}, ${b})`;
      }
    }
    return color;
  }

  function getContrastingColor(color: string): string {
    // Simple contrast calculation for RGB format
    if (color.startsWith('rgb')) {
      const rgbMatch = color.match(/\d+/g);
      if (rgbMatch && rgbMatch.length >= 3) {
        const r = parseInt(rgbMatch[0]);
        const g = parseInt(rgbMatch[1]);
        const b = parseInt(rgbMatch[2]);
        
        // Using relative luminance formula to determine contrast
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? "#000000" : "#ffffff";
      }
    }
    return "#ffffff";
  }

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      themeMode, 
      toggleTheme, 
      setTheme, 
      systemTheme,
      accentColor,
      setAccentColor
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
