import type {
  AudioChannelDefinition as BaseAudioChannelDefinition,
  AudioChannelState as BaseAudioChannelState,
  MusicTrackMap as BaseMusicTrackMap,
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

export type SoundMusicTrack = "classic" | "lightning" | "zen";

export type PlaySoundOptions = BasePlaySoundOptions;

export type SoundContextType<
  TEvent extends string = SoundEvent,
  TMusicTrack extends string = SoundMusicTrack,
> = BaseSoundContextType<TEvent, TMusicTrack>;

export type ToneDefinition = BaseToneDefinition;

export type SoundEventMap<TEvent extends string> = BaseSoundEventMap<TEvent>;
export type SoundMusicMap<TMusicTrack extends string = SoundMusicTrack> =
  BaseMusicTrackMap<TMusicTrack>;

export type SoundStorageKeys = BaseSoundStorageKeys;
export type SoundChannelDefinition = BaseAudioChannelDefinition;
export type SoundChannelState = BaseAudioChannelState;

export type SoundProviderProps<
  TEvent extends string = SoundEvent,
  TMusicTrack extends string = SoundMusicTrack,
> = SoundTemplateProviderProps<TEvent, TMusicTrack>;
