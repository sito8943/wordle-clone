import type { usePlayController } from "@views/Play/hooks";

type PlayControllerState = ReturnType<typeof usePlayController>;

export type HardModeProgressProps = Pick<
  PlayControllerState,
  | "showHardModeFinalStretchBar"
  | "hardModeSecondsLeft"
  | "hardModeFinalStretchProgressPercent"
>;
