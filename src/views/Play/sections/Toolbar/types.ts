import type { PlayControllerState } from "@views/Play/providers/types";
import type { CSSProperties } from "react";

export type ToolbarTimerProps = Pick<
  PlayControllerState,
  "showHardModeTimer" | "hardModeSecondsLeft" | "hardModeTickPulse"
> & {
  hardModeClockBoostScale: number;
};

export type NativeKeyboardClockStyle = CSSProperties;
