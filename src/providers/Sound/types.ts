export type SoundEvent =
  | "letter_put"
  | "letter_delete"
  | "line_change"
  | "tile_present"
  | "tile_correct"
  | "tile_absent"
  | "round_loss"
  | "round_win";

export type PlaySoundOptions = {
  delayMs?: number;
};

export type SoundContextType = {
  playSound: (event: SoundEvent, options?: PlaySoundOptions) => void;
};

export type ToneDefinition = {
  frequency: number;
  durationMs: number;
  gain: number;
  waveform: OscillatorType;
  delayMs?: number;
  attackMs?: number;
  releaseMs?: number;
};
