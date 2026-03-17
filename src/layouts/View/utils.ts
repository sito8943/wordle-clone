import type { Player } from "@domain/wordle";
import { PLAYER_STORAGE_KEY } from "./constants";
import { DEFAULT_PLAYER } from "@providers/Player/constants";

export const shouldAskForInitialPlayerName = (): boolean => {
  try {
    const userData = JSON.parse(
      localStorage.getItem(PLAYER_STORAGE_KEY) ?? "",
    ) as unknown as Player;

    return (
      localStorage.getItem(PLAYER_STORAGE_KEY) === null ||
      userData.name === DEFAULT_PLAYER.name
    );
  } catch {
    return false;
  }
};
