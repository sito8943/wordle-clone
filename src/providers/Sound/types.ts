import type {
  PlaySoundOptions as BasePlaySoundOptions,
  SoundContextType as BaseSoundContextType,
  SoundEventMap as BaseSoundEventMap,
  SoundStorageKeys as BaseSoundStorageKeys,
  SoundTemplateProviderProps,
  ToneDefinition as BaseToneDefinition,
} from "sito-sound-provider";

export type SoundEvent =
  | "letter_put"
  | "letter_delete"
  | "round_start"
  | "guess_invalid"
  | "hint_use"
  | "line_change"
  | "tile_present"
  | "tile_correct"
  | "tile_absent"
  | "round_loss"
  | "round_win";

export type PlaySoundOptions = BasePlaySoundOptions;

export type SoundContextType<TEvent extends string = SoundEvent> =
  BaseSoundContextType<TEvent>;

export type ToneDefinition = BaseToneDefinition;

export type SoundEventMap<TEvent extends string> = BaseSoundEventMap<TEvent>;

export type SoundStorageKeys = BaseSoundStorageKeys;

export type SoundProviderProps<TEvent extends string> =
  SoundTemplateProviderProps<TEvent>;
