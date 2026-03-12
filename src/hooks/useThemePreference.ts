import { useCallback, useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";

export type ThemePreference = "system" | "light" | "dark";

type ResolvedTheme = "light" | "dark";

type UseThemePreferenceOptions = {
  applyToDocument?: boolean;
};

export const THEME_PREFERENCE_STORAGE_KEY = "wordle:theme-preference";
export const DEFAULT_THEME_PREFERENCE: ThemePreference = "system";
const THEME_PREFERENCE_SYNC_EVENT = "wordle:theme-preference:sync";

const isThemePreference = (value: unknown): value is ThemePreference =>
  value === "system" || value === "light" || value === "dark";

const resolveTheme = (
  preference: ThemePreference,
  prefersDark: boolean,
): ResolvedTheme => {
  if (preference === "system") {
    return prefersDark ? "dark" : "light";
  }

  return preference;
};

const getSystemPrefersDark = (): boolean => {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return false;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

const applyThemeToDocument = (theme: ResolvedTheme): void => {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
};

export default function useThemePreference(
  options: UseThemePreferenceOptions = {},
) {
  const { applyToDocument = false } = options;
  const [storedPreference, setStoredPreference] =
    useLocalStorage<ThemePreference>(
      THEME_PREFERENCE_STORAGE_KEY,
      DEFAULT_THEME_PREFERENCE,
    );

  const themePreference = isThemePreference(storedPreference)
    ? storedPreference
    : DEFAULT_THEME_PREFERENCE;

  const setThemePreference = useCallback(
    (nextPreference: ThemePreference) => {
      const normalizedPreference = isThemePreference(nextPreference)
        ? nextPreference
        : DEFAULT_THEME_PREFERENCE;

      setStoredPreference(normalizedPreference);

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent<ThemePreference>(THEME_PREFERENCE_SYNC_EVENT, {
            detail: normalizedPreference,
          }),
        );
      }
    },
    [setStoredPreference],
  );

  useEffect(() => {
    if (storedPreference === themePreference) {
      return;
    }

    setThemePreference(themePreference);
  }, [setThemePreference, storedPreference, themePreference]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const onThemePreferenceSync = (event: Event) => {
      const customEvent = event as CustomEvent<ThemePreference>;
      if (!isThemePreference(customEvent.detail)) {
        return;
      }

      setStoredPreference(customEvent.detail);
    };

    window.addEventListener(THEME_PREFERENCE_SYNC_EVENT, onThemePreferenceSync);

    return () => {
      window.removeEventListener(
        THEME_PREFERENCE_SYNC_EVENT,
        onThemePreferenceSync,
      );
    };
  }, [setStoredPreference]);

  useEffect(() => {
    if (!applyToDocument) {
      return;
    }

    const mediaQuery =
      typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : null;

    const syncTheme = () => {
      const resolvedTheme = resolveTheme(
        themePreference,
        mediaQuery ? mediaQuery.matches : getSystemPrefersDark(),
      );
      applyThemeToDocument(resolvedTheme);
    };

    syncTheme();

    if (themePreference !== "system" || !mediaQuery) {
      return;
    }

    const onSystemThemeChange = () => {
      syncTheme();
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", onSystemThemeChange);
      return () =>
        mediaQuery.removeEventListener("change", onSystemThemeChange);
    }

    mediaQuery.addListener(onSystemThemeChange);
    return () => mediaQuery.removeListener(onSystemThemeChange);
  }, [applyToDocument, themePreference]);

  return {
    themePreference,
    setThemePreference,
  };
}
