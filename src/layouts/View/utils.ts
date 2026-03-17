import { PLAYER_STORAGE_KEY } from "./constants";

export const shouldAskForInitialPlayerName = (): boolean => {
  try {
    return localStorage.getItem(PLAYER_STORAGE_KEY) === null;
  } catch {
    return false;
  }
};
