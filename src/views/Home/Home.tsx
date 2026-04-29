import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGear,
  faPlayCircle,
  faTrophy,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "@i18n";
import { Alert } from "@components";
import { useFeatureFlags } from "@providers/FeatureFlags";
import {
  HOME_DONATED_HASH,
  HOME_ENTRY_ANIMATION_SESSION_KEY,
  HOME_NAV_ITEMS_ENTRY_INITIAL_DELAY_MS,
  HOME_NAV_ITEMS_ENTRY_STAGGER_DELAY_MS,
} from "./constants";
import { env } from "@config/env";
import { ROUTES } from "@config/routes";
import { faPaypal } from "@fortawesome/free-brands-svg-icons";
import { HOME_MENU_SEEN_SESSION_STORAGE_KEY } from "@domain/wordle";
import {
  hasSeenEntryAnimationInSession,
  markEntryAnimationAsSeenInSession,
} from "@utils/entryAnimationSession";
import type { HomeNavigationLink } from "./types";

const Home = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const { paypalDonationButtonEnabled } = useFeatureFlags();
  const [shouldAnimateEntry] = useState(
    () => !hasSeenEntryAnimationInSession(HOME_ENTRY_ANIMATION_SESSION_KEY),
  );
  const [entryAnimationReady, setEntryAnimationReady] = useState(
    () => !shouldAnimateEntry,
  );
  const showDonationAlert = location.hash === HOME_DONATED_HASH;

  useEffect(() => {
    markEntryAnimationAsSeenInSession(HOME_MENU_SEEN_SESSION_STORAGE_KEY);
  }, []);

  useEffect(() => {
    if (!shouldAnimateEntry) {
      return;
    }

    markEntryAnimationAsSeenInSession(HOME_ENTRY_ANIMATION_SESSION_KEY);
    const frameId = window.requestAnimationFrame(() => {
      setEntryAnimationReady(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [shouldAnimateEntry]);

  const links = useMemo(
    (): HomeNavigationLink[] => [
      { to: ROUTES.PLAY, label: t("nav.play"), icon: faPlayCircle },
      { to: ROUTES.SETTINGS, label: t("profile.settingsTitle"), icon: faGear },
      { to: ROUTES.SCOREBOARD, label: t("nav.scoreboard"), icon: faTrophy },
    ],
    [t],
  );

  const getItemTransitionDelay = (index: number) =>
    `${HOME_NAV_ITEMS_ENTRY_INITIAL_DELAY_MS + index * HOME_NAV_ITEMS_ENTRY_STAGGER_DELAY_MS}ms`;

  return (
    <main className="page-centered flex-1 gap-8 px-4">
      <h2
        className={`slab text-center text-6xl font-black tracking-widest text-black sm:text-8xl dark:text-neutral-100 transition-[opacity,translate,scale] duration-500 ease-out motion-reduce:transition-none ${
          entryAnimationReady
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 -translate-y-3 scale-95"
        }`}
      >
        {t("app.title").toUpperCase()}
      </h2>
      {showDonationAlert && (
        <div className="w-full max-w-sm">
          <Alert message={t("home.donationThankYouAlert")} color="success" />
        </div>
      )}
      <nav className={`w-full max-w-sm`}>
        <ul className="flex flex-col gap-3">
          {links.map((link, index) => (
            <li
              key={link.to}
              className={`transition-[scale,translate] duration-500 ease-out motion-reduce:transition-none ${
                entryAnimationReady
                  ? "translate-y-0 scale-100"
                  : "translate-y-2 scale-0"
              }`}
              style={{ transitionDelay: getItemTransitionDelay(index) }}
            >
              <Link
                to={link.to}
                className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-neutral-300 bg-white/80 px-5 py-4 text-lg font-semibold text-neutral-800 transition-colors hover:border-primary hover:text-primary dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-100 dark:hover:border-primary dark:hover:text-primary"
              >
                <FontAwesomeIcon icon={link.icon} aria-hidden="true" />
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
          {paypalDonationButtonEnabled ? (
            <li
              className={`transition-[scale,translate] duration-500 ease-out motion-reduce:transition-none ${
                entryAnimationReady
                  ? "translate-y-0 scale-100"
                  : "translate-y-2 scale-0"
              }`}
              style={{ transitionDelay: getItemTransitionDelay(links.length) }}
            >
              <a
                href={env.paypalDonationButtonUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-neutral-300 bg-white/80 px-5 py-4 text-lg font-semibold text-neutral-800 transition-colors hover:border-primary hover:text-primary dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-100 dark:hover:border-primary dark:hover:text-primary"
              >
                <FontAwesomeIcon icon={faPaypal} aria-hidden="true" />
                <span>{t("home.donate")}</span>
              </a>
            </li>
          ) : null}
        </ul>
      </nav>
    </main>
  );
};

export default Home;
