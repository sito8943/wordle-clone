import { useTranslation } from "@i18n";

const SplashScreen = () => {
  const { t } = useTranslation();

  return (
    <div
      className="splash-screen"
      role="status"
      aria-live="polite"
      aria-label={t("splash.loadingAriaLabel")}
    >
      <h1 className="slab splash-word">{t("app.title")}</h1>
    </div>
  );
};

export default SplashScreen;
