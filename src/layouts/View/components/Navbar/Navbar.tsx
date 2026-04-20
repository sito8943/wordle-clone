import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleQuestion,
  faCrown,
  faGear,
  faPlayCircle,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "@i18n";
import { useFeatureFlags } from "@providers/FeatureFlags";
import NavLink from "./NavLink";
import { getScoreboardToneClassName } from "./utils";
import useNavbarController from "./useNavbarController";
import { Link } from "react-router";
import { ROUTES } from "@config/routes";
import type { NavLinkPropsType } from "./types";

const Navbar = () => {
  const { t } = useTranslation();
  const { helpButtonEnabled } = useFeatureFlags();
  const {
    currentClientRank,
    isCurrentClientRankLoading,
    rankTone,
    helpRoute,
    playRoute,
  } = useNavbarController();

  const positionLabel = useMemo(
    () =>
      isCurrentClientRankLoading ? (
        <FontAwesomeIcon
          icon={faSpinner}
          aria-hidden="true"
          className="animate-spin"
          data-testid="scoreboard-rank-spinner"
        />
      ) : currentClientRank === null ? (
        "#--"
      ) : (
        `#${currentClientRank}`
      ),
    [isCurrentClientRankLoading, currentClientRank],
  );
  const links = useMemo(() => {
    const navLinks: NavLinkPropsType[] = [
      { to: playRoute, label: t("nav.play"), icon: faPlayCircle },
    ];

    if (helpButtonEnabled) {
      navLinks.push({
        to: helpRoute,
        label: t("nav.help"),
        icon: faCircleQuestion,
      });
    }

    navLinks.push({
      to: ROUTES.SETTINGS,
      label: t("nav.profile"),
      icon: faGear,
    });
    navLinks.push({
      to: ROUTES.SCOREBOARD,
      label: t("nav.scoreboard"),
      extraLabel: positionLabel,
      ariaLabel: t("nav.scoreboard"),
      icon: faCrown,
      toneClassName: getScoreboardToneClassName(rankTone),
    });

    return navLinks;
  }, [helpButtonEnabled, helpRoute, playRoute, positionLabel, rankTone, t]);

  return (
    <header className="w-full items-center justify-between border-b border-neutral-300 dark:border-neutral-700 py-2 sm:py-3 sm:px-4 flex">
      <Link to={ROUTES.HOME}>
        <h1 className="pointer-events-none text-center text-3xl max-sm:text-xl font-black tracking-[0.28em] text-black dark:text-neutral-100">
          {t("app.title").toUpperCase()}
        </h1>
      </Link>
      <nav>
        <ul className="m-auto flex items-center justify-center gap-4 max-sm:gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-300">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                label={link.label}
                extraLabel={link.extraLabel}
                icon={link.icon}
                ariaLabel={link.ariaLabel}
                toneClassName={link.toneClassName}
              />
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
