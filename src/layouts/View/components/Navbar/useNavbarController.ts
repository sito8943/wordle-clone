import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import { env } from "@config";
import { useApi, usePlayer } from "@providers";
import { NAVBAR_TOP_TEN_LIMIT } from "./constants";

const useNavbarController = () => {
  const { scoreClient } = useApi();
  const { player } = usePlayer();
  const location = useLocation();

  const [currentClientRank, setCurrentClientRank] = useState<number | null>(
    null,
  );
  const [isCurrentClientRankLoading, setIsCurrentClientRankLoading] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadCurrentClientRank = async () => {
      setIsCurrentClientRankLoading(true);

      try {
        const result = await scoreClient.listTopScores(
          Math.max(env.scoreLimit, NAVBAR_TOP_TEN_LIMIT),
        );
        if (!cancelled) {
          setCurrentClientRank(result.currentClientRank);
        }
      } catch {
        if (!cancelled) {
          setCurrentClientRank(null);
        }
      } finally {
        if (!cancelled) {
          setIsCurrentClientRankLoading(false);
        }
      }
    };

    void loadCurrentClientRank();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, player.score, scoreClient]);

  const rankTone = useMemo(
    () => (isCurrentClientRankLoading ? null : currentClientRank),
    [currentClientRank, isCurrentClientRankLoading],
  );

  return {
    currentClientRank,
    isCurrentClientRankLoading,
    rankTone,
  };
};

export default useNavbarController;
