import { Button, Dialog } from "@components";
import { useTranslation } from "@i18n";
import type { VersionUpdateDialogProps } from "./types";

const VersionUpdateDialog = ({
  visible,
  onClose,
  currentVersion,
  previousVersion,
  versionHistory,
}: VersionUpdateDialogProps) => {
  const { t, i18n } = useTranslation();

  const formatReleaseDate = (value: string): string => {
    const parsedDate = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsedDate.getTime())) {
      return value;
    }

    const locale = i18n.language === "es" ? "es-ES" : "en-US";
    return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
      parsedDate,
    );
  };

  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      titleId="app-version-update-dialog-title"
      title={t("home.versionUpdateDialog.title", { version: currentVersion })}
      description={t("home.versionUpdateDialog.description", {
        previousVersion: previousVersion ?? "",
      })}
      panelClassName="max-w-2xl"
    >
      <div className="mt-4 flex max-h-[65vh] flex-col gap-5 overflow-y-auto pr-1">
        <section>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {t("home.versionUpdateDialog.historyTitle")}
          </h3>
          <ol className="mt-3 flex flex-col gap-3">
            {versionHistory.map((entry) => {
              const isCurrentVersion = entry.version === currentVersion;

              return (
                <li
                  key={`history-${entry.version}`}
                  className={`rounded-md border p-3 ${
                    isCurrentVersion
                      ? "border-primary bg-primary/10 dark:border-primary dark:bg-primary/20"
                      : "border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
                  }`}
                >
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {t("home.versionUpdateDialog.releaseLabel", {
                      version: entry.version,
                      date: formatReleaseDate(entry.releasedAt),
                    })}
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-700 dark:text-neutral-300">
                    {entry.changeKeys.map((changeKey) => (
                      <li key={`${entry.version}-${changeKey}`}>
                        {t(changeKey)}
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ol>
        </section>
        <div className="flex justify-end">
          <Button onClick={onClose}>
            {t("home.versionUpdateDialog.closeAction")}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default VersionUpdateDialog;
