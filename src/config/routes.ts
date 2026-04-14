export const ROUTES = {
  HOME: "/",
  PLAY: "/jugar",
  HELP: "/ayuda",
  SETTINGS: "/ajustes",
  PROFILE: "/perfil",
  SCOREBOARD: "/marcador",
  NOT_FOUND: "*",
} as const;

export const ROUTE_HASHES = {
  DIFFICULTY: "difficulty",
} as const;

export const ROUTE_ANCHORS = {
  DIFFICULTY: `#${ROUTE_HASHES.DIFFICULTY}`,
} as const;
