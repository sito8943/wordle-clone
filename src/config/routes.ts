export const ROUTES = {
  HOME: "/",
  PLAY: "/jugar",
  CLASSIC: "/clasico",
  ZEN: "/zen",
  LIGHTING: "/relampago",
  DAILY: "/palabra-diaria",
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

export const getHelpRoute = (modeId?: string | null): string => {
  if (!modeId) {
    return ROUTES.HELP;
  }

  const searchParams = new URLSearchParams({
    [ROUTE_SEARCH_PARAMS.MODE]: modeId,
  });

  return `${ROUTES.HELP}?${searchParams.toString()}`;
};
