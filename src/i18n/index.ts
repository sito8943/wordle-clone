import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import { resources } from "./resources";

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });
}

export { i18n, useTranslation };
