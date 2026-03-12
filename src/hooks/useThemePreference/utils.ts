import type { ThemePreference, ResolvedTheme } from "./types";

export const isThemePreference = (value: unknown): value is ThemePreference =>
  value === "system" || value === "light" || value === "dark";

export const resolveTheme = (
  preference: ThemePreference,
  prefersDark: boolean,
): ResolvedTheme => {
  if (preference === "system") {
    return prefersDark ? "dark" : "light";
  }

  return preference;
};

export const getSystemPrefersDark = (): boolean => {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return false;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

export const applyThemeToDocument = (theme: ResolvedTheme): void => {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
};
