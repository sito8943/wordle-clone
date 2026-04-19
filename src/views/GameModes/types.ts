import type { IconProp } from "@fortawesome/fontawesome-svg-core";

export type GameModeId = "zen" | "classic" | "lightning" | "daily";

export type GameModeCard = {
  id: GameModeId;
  to: string;
  icon: IconProp;
  iconClassName: string;
};

export type GameModeDetailKeyMap = Record<GameModeId, readonly string[]>;

export type GameModeTranslationValues = {
  rows: number;
  letters: number;
  seconds: number;
  hintCount: number;
  extraPoints: number;
  extraRows: number;
};
