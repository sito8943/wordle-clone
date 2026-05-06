import type { SoundEventMap, SoundEvent } from "./types";

export const WORDLE_SOUND_EVENT_MAP: SoundEventMap<SoundEvent> = {
  letter_put: {
    type: "tone",
    channelId: "sfx",
    tones: [
      {
        frequency: 720,
        durationMs: 28,
        gain: 0.03,
        waveform: "triangle",
      },
    ],
  },
  letter_delete: {
    type: "tone",
    channelId: "sfx",
    tones: [
      { frequency: 260, durationMs: 36, gain: 0.03, waveform: "square" },
    ],
  },
  line_change: {
    type: "tone",
    channelId: "sfx",
    tones: [
      {
        frequency: 480,
        durationMs: 32,
        gain: 0.03,
        waveform: "triangle",
      },
      {
        frequency: 620,
        durationMs: 34,
        gain: 0.028,
        waveform: "triangle",
        delayMs: 42,
      },
    ],
  },
  round_start: {
    type: "tone",
    channelId: "sfx",
    tones: [
      {
        frequency: 440,
        durationMs: 72,
        gain: 0.028,
        waveform: "triangle",
      },
      {
        frequency: 554,
        durationMs: 72,
        gain: 0.028,
        waveform: "triangle",
        delayMs: 85,
      },
      {
        frequency: 659,
        durationMs: 90,
        gain: 0.03,
        waveform: "triangle",
        delayMs: 170,
      },
    ],
  },
  guess_invalid: {
    type: "tone",
    channelId: "sfx",
    tones: [
      { frequency: 220, durationMs: 52, gain: 0.03, waveform: "square" },
      {
        frequency: 170,
        durationMs: 74,
        gain: 0.03,
        waveform: "square",
        delayMs: 45,
      },
    ],
  },
  hint_use: {
    type: "tone",
    channelId: "sfx",
    tones: [
      {
        frequency: 600,
        durationMs: 52,
        gain: 0.03,
        waveform: "triangle",
      },
      {
        frequency: 840,
        durationMs: 58,
        gain: 0.03,
        waveform: "triangle",
        delayMs: 65,
      },
    ],
  },
  tile_present: {
    type: "tone",
    channelId: "sfx",
    tones: [
      { frequency: 520, durationMs: 46, gain: 0.03, waveform: "square" },
    ],
  },
  tile_correct: {
    type: "tone",
    channelId: "sfx",
    tones: [
      { frequency: 760, durationMs: 54, gain: 0.032, waveform: "square" },
    ],
  },
  tile_absent: {
    type: "tone",
    channelId: "sfx",
    tones: [
      { frequency: 180, durationMs: 58, gain: 0.025, waveform: "sine" },
    ],
  },
  round_win: {
    type: "tone",
    channelId: "sfx",
    tones: [
      {
        frequency: 523,
        durationMs: 90,
        gain: 0.028,
        waveform: "triangle",
      },
      {
        frequency: 659,
        durationMs: 90,
        gain: 0.028,
        waveform: "triangle",
        delayMs: 110,
      },
      {
        frequency: 784,
        durationMs: 110,
        gain: 0.03,
        waveform: "triangle",
        delayMs: 220,
      },
      {
        frequency: 1047,
        durationMs: 140,
        gain: 0.03,
        waveform: "triangle",
        delayMs: 360,
      },
    ],
  },
  round_loss: {
    type: "tone",
    channelId: "sfx",
    tones: [
      { frequency: 392, durationMs: 110, gain: 0.026, waveform: "sine" },
      {
        frequency: 311,
        durationMs: 110,
        gain: 0.026,
        waveform: "sine",
        delayMs: 120,
      },
      {
        frequency: 233,
        durationMs: 140,
        gain: 0.027,
        waveform: "sine",
        delayMs: 240,
      },
    ],
  },
};
