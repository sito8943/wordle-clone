import { Button, Dialog } from "@components";
import { useTranslation } from "@i18n";
import type { VersionUpdateDialogProps } from "./types";

const VersionUpdateDialog = ({
  visible,
  onClose,
  onOpenCurrentChangelog,
  currentVersion,
  previousVersion,
  featuredChange,
  featuredImageSrc,
}: VersionUpdateDialogProps) => {
  const { t } = useTranslation();

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
      <div className="mt-4 flex max-h-[65vh] flex-col gap-4 overflow-y-auto pr-1">
        {previousVersion ? (
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            {t("home.versionUpdateDialog.previousVersionLabel", {
              previousVersion,
            })}
          </p>
        ) : null}
        <section className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900">
          <div className="grid gap-3 sm:grid-cols-[8rem_1fr] sm:items-center">
            <div className="overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-700">
              <img
                src={featuredImageSrc}
                alt={t("home.versionUpdateDialog.featuredImageAlt", {
                  version: currentVersion,
                })}
                className="h-28 w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {t("home.versionUpdateDialog.featuredTitle")}
              </h3>
              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                {featuredChange ??
                  t("home.versionUpdateDialog.featuredFallback")}
              </p>
            </div>
          </div>
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
