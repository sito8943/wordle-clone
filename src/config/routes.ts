import { WORDLE_MODE_IDS, type WordleModeId } from "@domain/wordle";

export const ROUTES = {
  HOME: "/",
  PLAY: "/jugar",
  CLASSIC: "/clasico",
  ZEN: "/zen",
  LIGHTING: "/relampago",
  DAILY: "/palabra-diaria",
  CHANGELOG: "/changelog/:version",
  HELP: "/ayuda",
  SETTINGS: "/ajustes",
  PROFILE: "/perfil",
  SCOREBOARD: "/marcador",
  NOT_FOUND: "*",
} as const;

export const ROUTE_SEARCH_PARAMS = {
  MODE: "mode",
} as const;

export const ROUTE_HASHES = {
  DIFFICULTY: "difficulty",
} as const;

export const ROUTE_ANCHORS = {
  DIFFICULTY: `#${ROUTE_HASHES.DIFFICULTY}`,
} as const;

const MODE_ROUTE_BY_ID: Record<WordleModeId, string> = {
  [WORDLE_MODE_IDS.CLASSIC]: ROUTES.CLASSIC,
  [WORDLE_MODE_IDS.LIGHTNING]: ROUTES.LIGHTING,
  [WORDLE_MODE_IDS.ZEN]: ROUTES.ZEN,
  [WORDLE_MODE_IDS.DAILY]: ROUTES.DAILY,
};

export const getModeRoute = (modeId: WordleModeId): string =>
  MODE_ROUTE_BY_ID[modeId];

export const getHelpRoute = (modeId?: string | null): string => {
  if (!modeId) {
    return ROUTES.HELP;
  }

  const searchParams = new URLSearchParams({
    [ROUTE_SEARCH_PARAMS.MODE]: modeId,
  });

  return `${ROUTES.HELP}?${searchParams.toString()}`;
};

export const getChangelogRoute = (version: string): string =>
  ROUTES.CHANGELOG.replace(":version", encodeURIComponent(version));
