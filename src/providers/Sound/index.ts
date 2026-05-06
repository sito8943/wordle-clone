import { SoundProvider } from "./SoundProvider";
import { useSound } from "./useSound";
import { WORDLE_SOUND_EVENT_MAP } from "./eventMap";
import { WORDLE_MUSIC_MAP } from "./musicMap";
import {
  WORDLE_SOUND_STORAGE_KEYS,
  WORDLE_SOUND_STORAGE_KEY_PREFIX,
} from "./constants";

export { SoundProvider, useSound };
export {
  WORDLE_SOUND_EVENT_MAP,
  WORDLE_MUSIC_MAP,
  WORDLE_SOUND_STORAGE_KEYS,
  WORDLE_SOUND_STORAGE_KEY_PREFIX,
};
export type {
  SoundChannelDefinition,
  SoundChannelState,
  PlaySoundOptions,
  SoundContextType,
  SoundEventMap,
  SoundEvent,
  SoundMusicMap,
  SoundMusicTrack,
  SoundProviderProps,
  SoundStorageKeys,
  ToneDefinition,
} from "./types";
