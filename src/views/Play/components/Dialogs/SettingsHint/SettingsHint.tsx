import { ROUTES } from "@config/routes";
import { useTranslation } from "@i18n";

const SettingsHint = () => {
  const { t } = useTranslation();

  return (
    <p className="text-xs text-neutral-600 dark:text-neutral-300">
      {t("play.endOfGame.settingsHintPrefix")}{" "}
      <a
        href={`${ROUTES.SETTINGS}#end-dialogs`}
        className="font-semibold text-primary underline decoration-primary/40 underline-offset-2 transition-colors hover:text-primary/80"
      >
        {t("play.endOfGame.settingsHintLink")}
      </a>{" "}
      {t("play.endOfGame.settingsHintSuffix")}
    </p>
  );
};

export default SettingsHint;
