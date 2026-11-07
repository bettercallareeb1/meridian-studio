"use client";

import React, { createContext, useCallback, useContext, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

export type ThemeMode = "light" | "dark";

const THEME_STORAGE_KEY = "meridian-theme";
const listeners = new Set<() => void>();

function notifyThemeListeners() {
  listeners.forEach((listener) => listener());
}

function getClientThemeSnapshot(): ThemeMode {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getServerThemeSnapshot(): ThemeMode {
  return "light";
}

function subscribeTheme(callback: () => void) {
  listeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === THEME_STORAGE_KEY) {
      const next = e.newValue === "dark" ? "dark" : "light";
      document.documentElement.classList.toggle("dark", next === "dark");
      callback();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (next: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getClientThemeSnapshot,
    getServerThemeSnapshot
  );

  const setTheme = useCallback((next: ThemeMode) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // ignore storage errors
    }
    document.documentElement.classList.toggle("dark", next === "dark");
    notifyThemeListeners();
  }, []);

  const toggleTheme = useCallback(() => {
    const current = getClientThemeSnapshot();
    setTheme(current === "dark" ? "light" : "dark");
  }, [setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Segmented Light / Dark switch designed for the sidebar bottom bar and auth bar.
 */
export function ThemeTogglePill() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="group"
      aria-label="Color theme"
      className="grid grid-cols-2 rounded-lg border border-[#E4E4E7] bg-[#E8E7E1] p-0.5 dark:border-[#27272F] dark:bg-[#19191E]"
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        aria-pressed={theme === "light"}
        className={`flex items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition ${
          theme === "light"
            ? "bg-[#FFFFFF] text-[#111111] shadow-2xs"
            : "text-[#52525B] hover:text-[#111111] dark:text-[#A1A1AA] dark:hover:text-[#F4F4F5]"
        }`}
      >
        <Sun className="h-3.5 w-3.5 text-[#D97706]" />
        Light
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        aria-pressed={theme === "dark"}
        className={`flex items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition ${
          theme === "dark"
            ? "bg-[#27272F] text-[#F4F4F5] shadow-2xs"
            : "text-[#52525B] hover:text-[#111111] dark:text-[#A1A1AA] dark:hover:text-[#F4F4F5]"
        }`}
      >
        <Moon className="h-3.5 w-3.5 text-[#6366F1]" />
        Dark
      </button>
    </div>
  );
}

/**
 * Compact button with label/icon for top bars and mobile header bars.
 */
export function ThemeToggleButton({ compact = false }: { compact?: boolean }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex items-center gap-1.5 rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-2.5 py-1.5 text-[12px] font-medium text-[#111111] transition hover:bg-[#F0EFEA] dark:border-[#27272F] dark:bg-[#19191E] dark:text-[#F4F4F5] dark:hover:bg-[#222229]"
    >
      {isDark ? (
        <Sun className="h-3.5 w-3.5 text-[#FBBF24]" />
      ) : (
        <Moon className="h-3.5 w-3.5 text-[#4F46E5]" />
      )}
      {!compact && <span>{isDark ? "Light" : "Dark"}</span>}
    </button>
  );
}
