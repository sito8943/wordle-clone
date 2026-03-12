import { useId } from "react";
import type { CSSProperties } from "react";
import type { FireProps } from "./types";
import {
  getFireVisualState,
  sanitizeCounter,
  type FireVisualState,
} from "./utils";
import "./Fire.css";

type FireVisualConfig = {
  scale: number;
  opacity: number;
  glowOpacity: number;
  floatDurationMs: number;
  flickerDurationMs: number;
  pulseDurationMs: number;
  emberDurationMs: number;
  shakeDurationMs: number;
};

const FIRE_VISUAL_CONFIG: Record<FireVisualState, FireVisualConfig> = {
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

const clampSize = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 24;
  }

  return Math.min(64, Math.max(12, value));
};

const Fire = ({ streak, size = 24, className = "" }: FireProps) => {
  const safeStreak = sanitizeCounter(streak);
  const visualState = getFireVisualState(safeStreak);
  const config = FIRE_VISUAL_CONFIG[visualState];

  const id = useId().replace(/:/g, "");
  const outerGradientId = `fire-shell-${id}`;
  const innerGradientId = `fire-core-${id}`;

  const cssVars = {
    "--fire-size": `${clampSize(size)}px`,
    "--fire-opacity": `${config.opacity}`,
    "--fire-scale": `${config.scale}`,
    "--fire-glow-opacity": `${config.glowOpacity}`,
    "--fire-float-duration": `${config.floatDurationMs}ms`,
    "--fire-flicker-duration": `${config.flickerDurationMs}ms`,
    "--fire-core-duration": `${Math.round(config.flickerDurationMs * 0.78)}ms`,
    "--fire-pulse-duration": `${config.pulseDurationMs}ms`,
    "--fire-ember-duration": `${config.emberDurationMs}ms`,
    "--fire-shake-duration": `${config.shakeDurationMs}ms`,
  } as CSSProperties;

  return (
    <span
      role="img"
      aria-label={`Streak fire level ${safeStreak}`}
      className={[
        "streak-fire",
        `streak-fire-state-${visualState}`,
        className,
      ].join(" ")}
      style={cssVars}
    >
      <span className="streak-fire-glyph">
        <svg
          viewBox="0 0 64 64"
          className="streak-fire-svg"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient
              id={outerGradientId}
              x1="0%"
              y1="100%"
              x2="0%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="55%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fde68a" />
            </linearGradient>
            <linearGradient
              id={innerGradientId}
              x1="0%"
              y1="100%"
              x2="0%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#fef9c3" />
            </linearGradient>
          </defs>

          <path
            className="streak-fire-shell"
            fill={`url(#${outerGradientId})`}
            d="M32 58c-10.7 0-19-7.8-19-18 0-8.9 6-15.7 11.4-21.8 3.8-4.2 7.3-8.1 8.3-13 .2-.9 1.3-1 1.8-.2 4.2 6.3 10.4 10 13.5 17.1A21.8 21.8 0 0 1 50 31c0 15.1-7.8 27-18 27Z"
          />
          <path
            className="streak-fire-core"
            fill={`url(#${innerGradientId})`}
            d="M32 51.5c-5.8 0-10.2-4.3-10.2-10 0-4.6 2.8-8.2 5.3-11.3 1.9-2.3 3.6-4.4 4.2-7.1.1-.6 1-.7 1.3-.2 2.4 3.7 5.9 5.8 7.7 9.8.7 1.6 1.1 3.2 1.1 4.9 0 8-4.2 13.9-9.4 13.9Z"
          />
          <circle
            className="streak-fire-ember streak-fire-ember-1"
            cx="23"
            cy="39"
            r="2.1"
          />
          <circle
            className="streak-fire-ember streak-fire-ember-2"
            cx="42"
            cy="37"
            r="1.7"
          />
          <circle
            className="streak-fire-ember streak-fire-ember-3"
            cx="33"
            cy="30"
            r="1.4"
          />
        </svg>
      </span>
    </span>
  );
};

export default Fire;
