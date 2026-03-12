import { useEffect, useMemo, useState } from "react";
import { faHouse, faTrophy, faUser } from "@fortawesome/free-solid-svg-icons";
import { useLocation } from "react-router";
import { env } from "../../config";
import { useApi, usePlayer } from "../../providers";
import NavLink from "./NavLink";
import { getScoreboardToneClassName } from "./utils";
import { TOP_TEN_LIMIT } from "./constants";

const Navbar = () => {
  const { scoreClient } = useApi();
  const { player } = usePlayer();
  const location = useLocation();

  const [currentClientRank, setCurrentClientRank] = useState<number | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;

    const loadCurrentClientRank = async () => {
      try {
        const result = await scoreClient.listTopScores(
          Math.max(env.scoreLimit, TOP_TEN_LIMIT),
        );
        if (!cancelled) {
          setCurrentClientRank(result.currentClientRank);
        }
      } catch {
        if (!cancelled) {
          setCurrentClientRank(null);
        }
      }
    };

    void loadCurrentClientRank();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, player.score, scoreClient]);

  const positionLabel =
    currentClientRank === null ? "#--" : `#${currentClientRank}`;

  const links = useMemo(
    () => [
      { to: "/", label: "Home", icon: faHouse },
      { to: "/profile", label: "Profile", icon: faUser },
      {
        to: "/scoreboard",
        label: "Scoreboard",
        extraLabel: positionLabel,
        ariaLabel: "Scoreboard",
        icon: faTrophy,
        toneClassName: getScoreboardToneClassName(currentClientRank),
      },
    ],
    [currentClientRank, positionLabel],
  );

  return (
    <header className="w-full items-center justify-between border-b border-neutral-300 dark:border-neutral-700 py-2 sm:py-3 flex">
      <h1 className="text-center text-3xl max-sm:text-xl font-black tracking-[0.28em] text-black dark:text-neutral-100">
        WORDLE
      </h1>
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
