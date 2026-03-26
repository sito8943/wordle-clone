import { Button } from "@components";
import { Dialog } from "@components/Dialogs/Dialog";
import { useTranslation } from "@i18n";
import {
  LANGUAGE_DIALOG_TITLE_ID,
  PROFILE_LANGUAGE_MODE_INPUT_ID,
} from "@views/Profile/constants";
import { useProfileView } from "@views/Profile/providers";

const LanguageDialog = () => {
  const { t } = useTranslation();
  const {
    controller: {
      isLanguageDialogOpen,
      pendingLanguage,
      closeLanguageDialog,
      changePendingLanguage,
      saveLanguage,
    },
  } = useProfileView();

  if (!isLanguageDialogOpen) {
    return null;
  }

  const browserLanguage = (() => {
    if (typeof navigator === "undefined") {
      return "en";
    }

    return navigator.language.trim().toLowerCase().startsWith("es")
      ? "es"
      : "en";
  })();

  return (
    <Dialog
      visible={isLanguageDialogOpen}
      onClose={closeLanguageDialog}
      titleId={LANGUAGE_DIALOG_TITLE_ID}
      title={t("profile.languageDialog.title")}
      description={t("profile.languageDialog.description")}
      panelClassName="max-w-md"
    >
      <div className="mt-4">
        <label
          htmlFor={PROFILE_LANGUAGE_MODE_INPUT_ID}
          className="profile-field-label"
        >
          {t("profile.labels.language")}
        </label>
        <select
          id={PROFILE_LANGUAGE_MODE_INPUT_ID}
          aria-label={t("profile.labels.languageMode")}
          value={pendingLanguage}
          onChange={(event) =>
            changePendingLanguage(event.target.value as typeof pendingLanguage)
          }
          className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none ring-primary/40 focus:ring-2 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
        >
          <option value="en">{t("profile.languageOptions.en")}</option>
          <option value="es">{t("profile.languageOptions.es")}</option>
        </select>
      </div>
      <p className="profile-help-text mt-3">
        {t("profile.languageDialog.browserDetected", {
          language: t(`profile.languageOptions.${browserLanguage}`),
        })}
      </p>
      <div className="mt-5 flex justify-end gap-3">
        <Button onClick={closeLanguageDialog} variant="ghost" color="neutral">
          {t("common.cancel")}
        </Button>
        <Button onClick={saveLanguage}>{t("profile.languageDialog.save")}</Button>
      </div>
    </Dialog>
  );
};

export default LanguageDialog;
