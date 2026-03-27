import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGear,
  faPlayCircle,
  faTrophy,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "@i18n";
import { HOME_ENTRY_ANIMATION_SESSION_KEY } from "./constants";

const hasSeenEntryAnimationInSession = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return (
      sessionStorage.getItem(HOME_ENTRY_ANIMATION_SESSION_KEY) === "seen"
    );
  } catch {
    return false;
  }
};

const markEntryAnimationAsSeenInSession = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.setItem(HOME_ENTRY_ANIMATION_SESSION_KEY, "seen");
  } catch {
    // Ignore sessionStorage errors.
  }
};

const Home = () => {
  const { t } = useTranslation();
  const [shouldAnimateEntry] = useState(() => !hasSeenEntryAnimationInSession());
  const [entryAnimationReady, setEntryAnimationReady] = useState(
    () => !shouldAnimateEntry,
  );

  useEffect(() => {
    if (!shouldAnimateEntry) {
      return;
    }

    markEntryAnimationAsSeenInSession();
    const frameId = window.requestAnimationFrame(() => {
      setEntryAnimationReady(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [shouldAnimateEntry]);

  const links = useMemo(
    () => [
      { to: "/play", label: t("nav.play"), icon: faPlayCircle },
      { to: "/settings", label: t("profile.settingsTitle"), icon: faGear },
      { to: "/scoreboard", label: t("nav.scoreboard"), icon: faTrophy },
    ],
    [t],
  );

  return (
    <main className="page-centered flex-1 gap-8 px-4">
      <h2
        className={`slab text-center text-6xl font-black tracking-widest text-black sm:text-8xl dark:text-neutral-100 transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none ${
          entryAnimationReady ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        {t("app.title").toUpperCase()}
      </h2>
      <nav
        className={`w-full max-w-sm transition-[opacity,transform] duration-500 ease-out delay-150 motion-reduce:transition-none ${
          entryAnimationReady ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <ul className="flex flex-col gap-3">
          {links.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-neutral-300 bg-white/80 px-5 py-4 text-lg font-semibold text-neutral-800 transition-colors hover:border-primary hover:text-primary dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-100 dark:hover:border-primary dark:hover:text-primary"
              >
                <FontAwesomeIcon icon={link.icon} aria-hidden="true" />
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
};

export default Home;
