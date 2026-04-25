import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import { env } from "@config";
import {
  getHelpRoute,
  getModeRoute,
  ROUTE_SEARCH_PARAMS,
  ROUTES,
} from "@config/routes";
import {
  readCurrentWordleModeId,
  resolveWordleModeId,
  resolvePlayableWordleModeId,
  SCOREBOARD_MODE_IDS,
  WORDLE_MODE_IDS,
  type WordleModeId,
} from "@domain/wordle";
import { useApi, usePlayer } from "@providers";
import { NAVBAR_TOP_TEN_LIMIT } from "./constants";

const HELP_MODE_BY_PATHNAME: Record<string, WordleModeId> = {
  [ROUTES.CLASSIC]: WORDLE_MODE_IDS.CLASSIC,
  [ROUTES.LIGHTING]: WORDLE_MODE_IDS.LIGHTNING,
  [ROUTES.ZEN]: WORDLE_MODE_IDS.ZEN,
  [ROUTES.DAILY]: WORDLE_MODE_IDS.DAILY,
};

const normalizePathname = (pathname: string): string => {
  if (pathname.length <= 1) {
    return pathname;
  }

  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
};

const useNavbarController = () => {
  const { scoreClient } = useApi();
  const { player } = usePlayer();
  const location = useLocation();

  const [currentClientRank, setCurrentClientRank] = useState<number | null>(
    null,
  );
  const [isCurrentClientRankLoading, setIsCurrentClientRankLoading] =
    useState(true);
  const scoreboardModeId =
    location.pathname === ROUTES.LIGHTING
      ? SCOREBOARD_MODE_IDS.LIGHTNING
      : SCOREBOARD_MODE_IDS.CLASSIC;
  const helpRoute = useMemo(() => {
    const modeId = HELP_MODE_BY_PATHNAME[normalizePathname(location.pathname)];
    return getHelpRoute(modeId ?? null);
  }, [location.pathname]);
  const activeModeId = useMemo((): WordleModeId | null => {
    const normalizedPathname = normalizePathname(location.pathname);
    const modeByPathname = HELP_MODE_BY_PATHNAME[normalizedPathname];
    if (modeByPathname) {
      return modeByPathname;
    }

    if (normalizedPathname !== ROUTES.HELP) {
      return null;
    }

    const searchParams = new URLSearchParams(location.search);
    const modeParam = searchParams.get(ROUTE_SEARCH_PARAMS.MODE);
    return modeParam ? resolveWordleModeId(modeParam) : null;
  }, [location.pathname, location.search]);
  const playRoute = useMemo(() => {
    const playModeId = resolvePlayableWordleModeId(readCurrentWordleModeId());

    return getModeRoute(playModeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    let cancelled = false;

    const loadCurrentClientRank = async () => {
      setIsCurrentClientRankLoading(true);

      try {
        const result = await scoreClient.listTopScores(
          Math.max(env.scoreLimit, NAVBAR_TOP_TEN_LIMIT),
          player.language,
          scoreboardModeId,
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
  }, [
    location.pathname,
    player.code,
    player.language,
    player.name,
    player.score,
    scoreboardModeId,
    scoreClient,
  ]);

  const rankTone = useMemo(
    () => (isCurrentClientRankLoading ? null : currentClientRank),
    [currentClientRank, isCurrentClientRankLoading],
  );

  return {
    currentClientRank,
    isCurrentClientRankLoading,
    rankTone,
    helpRoute,
    activeModeId,
    playRoute,
  };
};

export default useNavbarController;
