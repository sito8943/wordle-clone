export type FireProps = {
  streak: number;
  size?: number;
  className?: string;
};

export type FireStreakProps = {
  streak: number;
  size?: "sm" | "md";
  className?: string;
  noLabel?: boolean;
};

export type FireVisualConfig = {
  scale: number;
  opacity: number;
  glowOpacity: number;
  floatDurationMs: number;
  flickerDurationMs: number;
  pulseDurationMs: number;
  emberDurationMs: number;
  shakeDurationMs: number;
};
