import type { Player } from "@domain/wordle";
import type { ReactNode } from "react";
import type { usePlayController } from "../hooks";

export type PlayViewContextValue = {
  controller: PlayControllerState;
  player: Player;
  wordListButtonEnabled: boolean;
  developerConsoleEnabled: boolean;
  preferNativeKeyboard: boolean;
  animateTileEntry: boolean;
};

export type PlayViewProviderProps = {
  children: ReactNode;
};

export type PlayControllerState = ReturnType<typeof usePlayController>;
