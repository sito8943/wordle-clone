import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";

let initPromise: Promise<void> | null = null;

const loadResources = async () => {
  if (import.meta.env.MODE === "test") {
    const module = await import("./resources");
    return module.resources;
  }

  const module = await import("./resources");
  return module.resources;
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
        lng: "en",
        fallbackLng: "en",
        interpolation: {
          escapeValue: false,
        },
      }),
    )
    .then(() => undefined);

  return initPromise;
};

void initI18n();

export { i18n, initI18n, useTranslation };
