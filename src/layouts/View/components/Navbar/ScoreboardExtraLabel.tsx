import { useEffect, useMemo, useState, type JSX } from "react";
import { faCrown, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TOGGLE_INTERVAL_MS } from "./constants";
import type { ScoreboardExtraLabelProps } from "./types";

const ScoreboardExtraLabel = ({
  currentClientRank,
  isCurrentClientRankLoading,
}: ScoreboardExtraLabelProps): JSX.Element => {
  const [showRank, setShowRank] = useState(true);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setShowRank((previousValue) => !previousValue);
    }, TOGGLE_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const rankLabel = useMemo(() => {
    if (isCurrentClientRankLoading) {
      return (
        <FontAwesomeIcon
          icon={faSpinner}
          aria-hidden="true"
          className="animate-spin"
          data-testid="scoreboard-rank-spinner"
        />
      );
    }

    if (currentClientRank === null) {
      return "#--";
    }

    return `#${currentClientRank}`;
  }, [currentClientRank, isCurrentClientRankLoading]);

  const rankIsVisible = isCurrentClientRankLoading || showRank;

  return (
    <>
      <span className="relative inline-flex h-5 sm:w-10 max-sm:w-7 items-center justify-center overflow-hidden sm:hidden">
        <span
          data-testid="scoreboard-mobile-rank-label"
          aria-hidden={!rankIsVisible}
          className={`absolute inset-0 inline-flex items-center justify-center transition-all duration-500 ease-out ${
            rankIsVisible
              ? "opacity-100 blur-0 translate-x-0"
              : "opacity-0 blur-[2px] translate-x-2"
          }`}
        >
          {rankLabel}
        </span>
        <span
          data-testid="scoreboard-mobile-crown-label"
          aria-hidden={rankIsVisible}
          className={`absolute inset-0 inline-flex items-center justify-center transition-all duration-500 ease-out ${
            rankIsVisible
              ? "opacity-0 blur-[2px] translate-x-2"
              : "opacity-100 blur-0 translate-x-0"
          }`}
        >
          <FontAwesomeIcon
            icon={faCrown}
            aria-hidden="true"
            className="text-lg"
          />
        </span>
      </span>
      <span className="hidden sm:inline">{rankLabel}</span>
    </>
  );
};

export default ScoreboardExtraLabel;
