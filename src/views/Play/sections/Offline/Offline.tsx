import type { JSX } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { buildWhatsAppContactHref } from "../utils";
import { env } from "@config";
import { ROUTES } from "@config/routes";

export const PlayOfflineState = (): JSX.Element => {
  const { t } = useTranslation();
  const contactHref = buildWhatsAppContactHref(env.wordReportPhoneNumber);

  return (
    <main
      id="play-offline"
      className="page-centered flex-1 gap-6 px-4 text-center max-sm:py-10"
    >
      <div className="flex w-full flex-col gap-5">
        <h1 className="slab text-3xl font-black tracking-tight text-neutral-900 sm:text-5xl dark:text-neutral-100">
          {t("play.offlineState.title")}
        </h1>
        <p className="text-base text-neutral-700 sm:text-lg dark:text-neutral-300">
          {t("play.offlineState.description")}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {contactHref ? (
          <a
            href={contactHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-xl border border-primary bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            {t("play.offlineState.contactAction")}
          </a>
        ) : null}
        <Link
          to={ROUTES.SETTINGS}
          className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white/90 px-5 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:border-primary hover:text-primary dark:border-neutral-600 dark:bg-neutral-800/70 dark:text-neutral-100 dark:hover:border-primary dark:hover:text-primary"
        >
          {t("play.offlineState.settingsAction")}
        </Link>
      </div>
    </main>
  );
};
