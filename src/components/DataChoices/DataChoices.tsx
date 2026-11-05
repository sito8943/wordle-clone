import { useTranslation } from "@i18n";
import { useConsent } from "@providers/Consent/useConsent";
import { Button } from "../Button";
import { DATA_CHOICES_BODY_ID, DATA_CHOICES_TITLE_ID } from "./constants";

/**
 * Asks before turning on optional technologies. Accept and reject have the
 * same weight; the choice can be changed later in Settings. No "cookie" in
 * names or classes: ad blockers hide them.
 */
const DataChoices = () => {
  const { t } = useTranslation();
  const { isNoticeOpen, setAnalytics } = useConsent();

  if (!isNoticeOpen) {
    return null;
  }

  return (
    <section
      role="dialog"
      aria-live="polite"
      aria-labelledby={DATA_CHOICES_TITLE_ID}
      aria-describedby={DATA_CHOICES_BODY_ID}
      className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-40 mx-auto flex max-w-2xl flex-col gap-3 rounded-2xl border border-neutral-300 bg-white p-4 text-neutral-900 shadow-lg sm:flex-row sm:items-center dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
    >
      <div className="flex flex-1 flex-col gap-1 text-sm">
        <h2 id={DATA_CHOICES_TITLE_ID} className="text-base font-semibold">
          {t("privacy.notice.title")}
        </h2>
        <p id={DATA_CHOICES_BODY_ID}>{t("privacy.notice.body")}</p>
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          color="neutral"
          className="flex-1 justify-center whitespace-nowrap sm:flex-none"
          onClick={() => setAnalytics(false)}
        >
          {t("privacy.notice.reject")}
        </Button>
        <Button
          type="button"
          variant="outline"
          color="neutral"
          className="flex-1 justify-center whitespace-nowrap sm:flex-none"
          onClick={() => setAnalytics(true)}
        >
          {t("privacy.notice.accept")}
        </Button>
      </div>
    </section>
  );
};

export default DataChoices;
