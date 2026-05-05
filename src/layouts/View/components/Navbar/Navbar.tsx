import { useMemo } from "react";
import {
  faCircleQuestion,
  faCrown,
  faGear,
  faPlayCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "@i18n";
import { useFeatureFlags } from "@providers/FeatureFlags";
import NavLink from "./NavLink";
import { getScoreboardToneClassName } from "./utils";
import useNavbarController from "./useNavbarController";
import { Link } from "react-router";
import { ROUTES } from "@config/routes";
import type { NavLinkPropsType } from "./types";
import ScoreboardExtraLabel from "./ScoreboardExtraLabel";

const Navbar = () => {
  const { t } = useTranslation();
  const { helpButtonEnabled } = useFeatureFlags();
  const {
    currentClientRank,
    isCurrentClientRankLoading,
    rankTone,
    helpRoute,
    activeModeId,
    playRoute,
    titleRoute,
  } = useNavbarController();
  const navbarTitle = useMemo(
    () =>
      activeModeId ? t(`gameModes.modes.${activeModeId}.name`) : t("app.title"),
    [activeModeId, t],
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
      extraLabel: (
        <ScoreboardExtraLabel
          currentClientRank={currentClientRank}
          isCurrentClientRankLoading={isCurrentClientRankLoading}
        />
      ),
      ariaLabel: t("nav.scoreboard"),
      icon: faCrown,
      iconClassName: "max-sm:!hidden text-lg sm:inline-block",
      toneClassName: getScoreboardToneClassName(rankTone),
    });

    return navLinks;
  }, [
    currentClientRank,
    helpButtonEnabled,
    helpRoute,
    isCurrentClientRankLoading,
    playRoute,
    rankTone,
    t,
  ]);

  return (
    <header className="w-full items-center justify-between border-b border-neutral-300 dark:border-neutral-700 py-2 sm:py-3 sm:px-4 flex">
      <Link to={titleRoute}>
        <h1 className="pointer-events-none text-center text-3xl max-sm:text-xl font-black tracking-[0.28em] text-black dark:text-neutral-100">
          {navbarTitle.toUpperCase()}
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
                iconClassName={link.iconClassName}
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
