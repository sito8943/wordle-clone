import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { Button, Dialog, ErrorBoundary, ErrorFallback } from "@components";
import { useTranslation } from "@i18n";
import { Navbar, Footer } from "./components";
import { useAnimationsPreference, useThemePreference } from "@hooks";
import { useApi, usePlayer } from "@providers";
import { normalizePlayerName } from "@providers/Player/utils";
import { env } from "@config/env";
import { ROUTES } from "@config/routes";
import { VIEW_VERSION_HISTORY } from "./constants";
import {
  getStoredAppVersion,
  getVersionHistoryEntriesForUpdate,
  isVersionNewer,
  shouldAskForInitialPlayerName,
  storeAppVersion,
} from "./utils";

const InitialPlayerDialog = lazy(
  () =>
    import("@layouts/View/components/InitialPlayerDialog/InitialPlayerDialog"),
);

const View = () => {
  const { t, i18n } = useTranslation();
  const { scoreClient } = useApi();
  const { player, recoverPlayer, updatePlayer } = usePlayer();
  const { pathname, hash } = useLocation();
  const isHomeRoute = pathname === ROUTES.HOME;
  useThemePreference({ applyToDocument: true });
  useAnimationsPreference({ applyToDocument: true });
  const [showInitialPlayerDialog, setShowInitialPlayerDialog] = useState(
    shouldAskForInitialPlayerName,
  );
  const [versionDialogVisible, setVersionDialogVisible] = useState(false);
  const [previousAppVersion, setPreviousAppVersion] = useState<string | null>(
    null,
  );

  const confirmInitialPlayerName = useCallback(
    async (name: string): Promise<string | null> => {
      try {
        await updatePlayer(name);
        setShowInitialPlayerDialog(false);
        return null;
      } catch (error) {
        return error instanceof Error
          ? error.message
          : t("layout.initialPlayer.nameValidationError");
      }
    },
    [t, updatePlayer],
  );

  const recoverInitialPlayer = useCallback(
    async (code: string): Promise<string | null> => {
      try {
        await recoverPlayer(code);
        setShowInitialPlayerDialog(false);
        return null;
      } catch (error) {
        return error instanceof Error
          ? error.message
          : t("layout.initialPlayer.nameValidationError");
      }
    },
    [recoverPlayer, t],
  );

  const validateInitialPlayerName = useCallback(
    async (name: string): Promise<string | null> => {
      const normalizedName = normalizePlayerName(name);

      try {
        const isAvailable = await scoreClient.isNickAvailable(normalizedName);
        if (!isAvailable) {
          return t("layout.initialPlayer.nameNotAvailable");
        }

        return null;
      } catch {
        return t("layout.initialPlayer.nameValidationError");
      }
    },
    [scoreClient, t],
  );

  useEffect(() => {
    const currentVersion = env.appVersion;
    const storedVersion = getStoredAppVersion();

    if (!storedVersion) {
      storeAppVersion(currentVersion);
      return;
    }

    if (storedVersion === currentVersion) {
      return;
    }

    if (isVersionNewer(currentVersion, storedVersion)) {
      setPreviousAppVersion(storedVersion);
      setVersionDialogVisible(true);
    }

    storeAppVersion(currentVersion);
  }, []);

  const changelogEntries = useMemo(() => {
    if (!previousAppVersion) {
      return [];
    }

    return getVersionHistoryEntriesForUpdate(
      VIEW_VERSION_HISTORY,
      previousAppVersion,
      env.appVersion,
    );
  }, [previousAppVersion]);

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

  useEffect(() => {
    if (hash.length <= 1) {
      return;
    }

    const targetId = (() => {
      try {
        return decodeURIComponent(hash.slice(1));
      } catch {
        return hash.slice(1);
      }
    })();

    if (targetId.length === 0) {
      return;
    }

    let isDone = false;
    let observer: MutationObserver | null = null;
    let disconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let initialCheckTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const scrollToTargetIfFound = (): void => {
      if (isDone) {
        return;
      }

      const element = document.getElementById(targetId);
      if (!element) {
        return;
      }

      isDone = true;
      element.scrollIntoView({ block: "start" });
      observer?.disconnect();
      if (disconnectTimeoutId !== null) {
        clearTimeout(disconnectTimeoutId);
      }
    };

    initialCheckTimeoutId = setTimeout(scrollToTargetIfFound, 0);

    if (typeof MutationObserver !== "undefined" && document.body) {
      observer = new MutationObserver(scrollToTargetIfFound);
      observer.observe(document.body, { childList: true, subtree: true });
    }

    disconnectTimeoutId = setTimeout(() => {
      observer?.disconnect();
    }, 2000);

    return () => {
      isDone = true;
      observer?.disconnect();
      if (initialCheckTimeoutId !== null) {
        clearTimeout(initialCheckTimeoutId);
      }
      if (disconnectTimeoutId !== null) {
        clearTimeout(disconnectTimeoutId);
      }
    };
  }, [hash, pathname]);

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
      <div className="mx-auto flex min-h-screen w-full flex-col max-sm:p-3 p-1">
        <Navbar />
        <ErrorBoundary
          name="route-outlet"
          resetKeys={[pathname]}
          fallback={() => (
            <main className="page-centered py-10">
              <ErrorFallback
                title={t("errors.routeOutlet.title")}
                description={t("errors.routeOutlet.description")}
                actionLabel={t("errors.routeOutlet.action")}
              />
            </main>
          )}
        >
          <Outlet />
        </ErrorBoundary>
      </div>
      <Footer alwaysVisible={isHomeRoute} />
      <Dialog
        visible={versionDialogVisible}
        onClose={() => setVersionDialogVisible(false)}
        titleId="app-version-update-dialog-title"
        title={t("home.versionUpdateDialog.title", { version: env.appVersion })}
        description={t("home.versionUpdateDialog.description", {
          previousVersion: previousAppVersion ?? "",
        })}
        panelClassName="max-w-2xl"
      >
        <div className="mt-4 flex max-h-[65vh] flex-col gap-5 overflow-y-auto pr-1">
          <section className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-800/60">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {t("home.versionUpdateDialog.changelogTitle")}
            </h3>
            {changelogEntries.length > 0 ? (
              <ul className="mt-3 flex flex-col gap-3">
                {changelogEntries.map((entry) => (
                  <li
                    key={`changelog-${entry.version}`}
                    className="rounded-md border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900"
                  >
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {t("home.versionUpdateDialog.releaseLabel", {
                        version: entry.version,
                        date: formatReleaseDate(entry.releasedAt),
                      })}
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-700 dark:text-neutral-300">
                      {entry.changeKeys.map((changeKey) => (
                        <li key={changeKey}>{t(changeKey)}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
                {t("home.versionUpdateDialog.emptyChangelog")}
              </p>
            )}
          </section>
          <section>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {t("home.versionUpdateDialog.historyTitle")}
            </h3>
            <ol className="mt-3 flex flex-col gap-3">
              {VIEW_VERSION_HISTORY.map((entry) => {
                const isCurrentVersion = entry.version === env.appVersion;

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
            <Button onClick={() => setVersionDialogVisible(false)}>
              {t("home.versionUpdateDialog.closeAction")}
            </Button>
          </div>
        </div>
      </Dialog>
      <Suspense fallback={null}>
        {showInitialPlayerDialog ? (
          <InitialPlayerDialog
            visible={showInitialPlayerDialog}
            onClose={() => undefined}
            initialName={player.name}
            onConfirm={confirmInitialPlayerName}
            onRecover={recoverInitialPlayer}
            onValidateName={validateInitialPlayerName}
          />
        ) : null}
      </Suspense>
    </div>
  );
};

export default View;
