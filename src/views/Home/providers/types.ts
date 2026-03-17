import type { Player } from "@domain/wordle";
import type { useHomeController } from "@hooks";
import type { ReactNode } from "react";

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
