import type { FireVisualConfig } from "./types";
import type { FireVisualState } from "./types";

export const FIRE_VISUAL_CONFIG: Record<FireVisualState, FireVisualConfig> = {
  0: {
    scale: 0.72,
    opacity: 0.08,
    glowOpacity: 0,
    floatDurationMs: 2200,
    flickerDurationMs: 1200,
    pulseDurationMs: 1400,
    emberDurationMs: 1800,
    shakeDurationMs: 110,
  },
  1: {
    scale: 0.88,
    opacity: 1,
    glowOpacity: 0.14,
    floatDurationMs: 1750,
    flickerDurationMs: 980,
    pulseDurationMs: 1200,
    emberDurationMs: 1480,
    shakeDurationMs: 100,
  },
  2: {
    scale: 1.08,
    opacity: 1,
    glowOpacity: 0.55,
    floatDurationMs: 650,
    flickerDurationMs: 260,
    pulseDurationMs: 340,
    emberDurationMs: 520,
    shakeDurationMs: 50,
  },
  3: {
    scale: 1.18,
    opacity: 1,
    glowOpacity: 0.8,
    floatDurationMs: 450,
    flickerDurationMs: 180,
    pulseDurationMs: 240,
    emberDurationMs: 420,
    shakeDurationMs: 28,
  },
};
