import type { SoundStorageKeys } from "./types";

export const WORDLE_SOUND_STORAGE_KEY_PREFIX = "wordle";
export const SOUND_MASTER_CHANNEL_ID = "master";

export const WORDLE_SOUND_STORAGE_KEYS: SoundStorageKeys = {
  soundEnabled: "wordle:sound-enabled",
  soundVolume: "wordle:sound-volume",
  soundMuted: "wordle:sound-muted",
};
export const TILE_STATUS_SOUND_INITIAL_DELAY_MS = 90;
export const TILE_STATUS_SOUND_STEP_DELAY_MS = 110;
