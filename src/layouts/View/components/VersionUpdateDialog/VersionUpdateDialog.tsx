import { Button, Dialog } from "@components";
import { getChangelogRoute } from "@config/routes";
import { useTranslation } from "@i18n";
import { Link } from "react-router";
import type { VersionUpdateDialogProps } from "./types";

const VersionUpdateDialog = ({
  visible,
  onClose,
  onOpenCurrentChangelog,
  onOpenVersionChangelog,
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

    const locale =
      i18n.language === "es" || i18n.language.startsWith("es-")
        ? "es-ES"
        : "en-US";
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
      description={t("home.versionUpdateDialog.description")}
      headerAction={<span aria-hidden="true" />}
      panelClassName="max-w-xl"
    >
      <div className="mt-4 flex max-h-[65vh] flex-col gap-5 overflow-y-auto pr-1">
        {previousVersion ? (
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            {t("home.versionUpdateDialog.previousVersionLabel", {
              previousVersion,
            })}
          </p>
        ) : null}
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
                  <Link
                    to={getChangelogRoute(entry.version)}
                    className="mt-2 text-sm font-semibold text-primary underline decoration-primary/40 underline-offset-2 transition-colors hover:text-primary/80"
                    onClick={(event) => {
                      event.preventDefault();
                      onOpenVersionChangelog(entry.version);
                    }}
                  >
                    {t("home.versionUpdateDialog.historyAction")}
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" color="neutral" onClick={onClose}>
            {t("home.versionUpdateDialog.closeAction")}
          </Button>
          <Button onClick={onOpenCurrentChangelog}>
            {t("home.versionUpdateDialog.currentVersionAction")}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default VersionUpdateDialog;
