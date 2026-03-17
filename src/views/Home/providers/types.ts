import type { Player } from "@domain/wordle";
import type { ReactNode } from "react";
import type { useHomeController } from "../hooks";

export type HomeViewContextValue = {
  controller: HomeControllerState;
  player: Player;
  wordListButtonEnabled: boolean;
  developerConsoleEnabled: boolean;
  preferNativeKeyboard: boolean;
  animateTileEntry: boolean;
};

export type HomeViewProviderProps = {
  children: ReactNode;
};

export type HomeControllerState = ReturnType<typeof useHomeController>;
