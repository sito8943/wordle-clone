import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlayCircle,
  faSpinner,
  faTrophy,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "@i18n";
import NavLink from "./NavLink";
import { getScoreboardToneClassName } from "./utils";
import useNavbarController from "./useNavbarController";
import { Link } from "react-router";

const Navbar = () => {
  const { t } = useTranslation();
  const { currentClientRank, isCurrentClientRankLoading, rankTone } =
    useNavbarController();

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
  const links = useMemo(
    () => [
      { to: "/", label: t("nav.play"), icon: faPlayCircle },
      { to: "/profile", label: t("nav.profile"), icon: faUser },
      {
        to: "/scoreboard",
        label: t("nav.scoreboard"),
        extraLabel: positionLabel,
        ariaLabel: t("nav.scoreboard"),
        icon: faTrophy,
        toneClassName: getScoreboardToneClassName(rankTone),
      },
    ],
    [positionLabel, rankTone, t],
  );

  return (
    <header className="w-full items-center justify-between border-b border-neutral-300 dark:border-neutral-700 py-2 sm:py-3 sm:px-4 flex">
      <Link to="/">
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
