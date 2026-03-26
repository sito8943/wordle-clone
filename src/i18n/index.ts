import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";

type SupportedLanguage = "en" | "es";

let initPromise: Promise<void> | null = null;

const loadResources = async () => {
  if (import.meta.env.MODE === "test") {
    const module = await import("./resources");
    return module.resources;
  }

  const module = await import("./resources");
  return module.resources;
};

const normalizeSupportedLanguage = (value: unknown): SupportedLanguage => {
  if (typeof value !== "string") {
    return "en";
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "es" || normalized.startsWith("es-")) {
    return "es";
  }

  return "en";
};

const resolveLanguageFromStoredPlayer = (): SupportedLanguage | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem("player");
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as { language?: unknown } | null;
    if (!parsed || parsed.language === undefined) {
      return null;
    }

    return normalizeSupportedLanguage(parsed.language);
  } catch {
    return null;
  }
};

const resolveInitialLanguage = (): SupportedLanguage => {
  if (import.meta.env.MODE === "test") {
    return "en";
  }

  const stored = resolveLanguageFromStoredPlayer();
  if (stored) {
    return stored;
  }

  if (typeof navigator !== "undefined") {
    return normalizeSupportedLanguage(navigator.language);
  }

  return "en";
};

const initI18n = (): Promise<void> => {
  if (i18n.isInitialized) {
    return Promise.resolve();
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = loadResources()
    .then((resources) =>
      i18n.use(initReactI18next).init({
        resources,
        lng: resolveInitialLanguage(),
        fallbackLng: "en",
        supportedLngs: ["en", "es"],
        interpolation: {
          escapeValue: false,
        },
      }),
    )
    .then(() => {
      if (typeof document !== "undefined") {
        document.documentElement.lang = normalizeSupportedLanguage(i18n.language);
      }

      i18n.on("languageChanged", (language) => {
        if (typeof document !== "undefined") {
          document.documentElement.lang = normalizeSupportedLanguage(language);
        }
      });
    })
    .then(() => undefined);

  return initPromise;
};

void initI18n();

export { i18n, initI18n, useTranslation };
