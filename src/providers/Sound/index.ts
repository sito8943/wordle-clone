import { SoundProvider } from "./SoundProvider";
import { useSound } from "./useSound";
import { WORDLE_SOUND_EVENT_MAP } from "./eventMap";
import { WORDLE_SOUND_STORAGE_KEYS } from "./constants";

export { SoundProvider, useSound };
export { WORDLE_SOUND_EVENT_MAP, WORDLE_SOUND_STORAGE_KEYS };
export type {
  PlaySoundOptions,
  SoundContextType,
  SoundEventMap,
  SoundEvent,
  SoundProviderProps,
  SoundStorageKeys,
  ToneDefinition,
} from "./types";
