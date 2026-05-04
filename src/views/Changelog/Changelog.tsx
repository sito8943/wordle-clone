import type { JSX } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ROUTES, getChangelogRoute } from "@config/routes";
import { useTranslation } from "@i18n";
import { Button } from "@components";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import {
  VIEW_VERSION_HISTORY,
  getResolvedVersionChangelog,
} from "@layouts/View/changelog";

const Changelog = (): JSX.Element => {
  const { t, i18n } = useTranslation();
  const { version } = useParams();
  const navigate = useNavigate();
  const currentVersion = version ?? "";
  const latestVersion = VIEW_VERSION_HISTORY[0]?.version;
  const changelog = version
    ? getResolvedVersionChangelog(version, i18n.language)
    : null;

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
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 py-8 pb-16">
      <section
        className="settings-entrance my-0!"
        style={{ animationDelay: "0ms" }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="ghost"
            color="neutral"
            icon={faChevronLeft}
            onClick={() => {
              navigate(ROUTES.HOME);
            }}
            className="!p-0"
          ></Button>
          <h2 className="page-title">{t("changelog.pageTitle")}</h2>
        </div>
        {version ? (
          <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
            {t("changelog.versionTitle", { version })}
          </p>
        ) : null}
        {changelog ? (
          <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
            {t("changelog.releaseLabel", {
              date: formatReleaseDate(changelog.releasedAt),
            })}
          </p>
        ) : null}
      </section>

      {changelog ? (
        <section
          className="settings-entrance my-0!"
          style={{ animationDelay: "80ms" }}
        >
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-neutral-800 dark:text-neutral-200">
            {changelog.changes.map((change, index) => (
              <li key={`${changelog.version}-${index}`}>{change}</li>
            ))}
          </ul>
        </section>
      ) : (
        <section
          className="settings-entrance my-0!"
          style={{ animationDelay: "80ms" }}
        >
          <h3 className="text-base font-semibold">
            {t("changelog.notFoundTitle")}
          </h3>
          <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
            {t("changelog.notFoundDescription")}
          </p>
          {latestVersion ? (
            <Link
              to={getChangelogRoute(latestVersion)}
              className="mt-3 inline-flex rounded border border-primary px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              {t("changelog.latestAction", { version: latestVersion })}
            </Link>
          ) : null}
        </section>
      )}

      <section
        className="settings-entrance my-0!"
        style={{ animationDelay: "160ms" }}
      >
        <h3 className="text-base font-semibold">
          {t("changelog.historyTitle")}
        </h3>
        <ol className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {VIEW_VERSION_HISTORY.map((entry) => {
            const isCurrentVersion = entry.version === currentVersion;

            return (
              <li
                key={entry.version}
                className={`flex flex-wrap items-center justify-between gap-3 rounded-md border p-3 ${
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
                {isCurrentVersion ? null : (
                  <Link
                    to={getChangelogRoute(entry.version)}
                    className="text-sm font-semibold text-primary underline decoration-primary/40 underline-offset-2 transition-colors hover:text-primary/80"
                  >
                    {t("changelog.historyAction")}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
};

export default Changelog;
