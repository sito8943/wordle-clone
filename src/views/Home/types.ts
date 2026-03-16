import type { CSSProperties, KeyboardEvent, ReactNode, RefObject } from "react";
import type useHomeController from "../../hooks/useHomeController/useHomeController";
import type { Player } from "../../providers/types";

export type HomeControllerState = ReturnType<typeof useHomeController>;

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

export type UseNativeKeyboardInputParams = {
  enabled: boolean;
  blocked: boolean;
  onKey: (key: string) => void;
};

export type UseNativeKeyboardInputResult = {
  nativeKeyboardInputRef: RefObject<HTMLInputElement | null>;
  focusNativeKeyboardInput: () => void;
  handleNativeKeyboardKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  handleNativeKeyboardInput: () => void;
};

export type NativeKeyboardClockStyle = CSSProperties;

export type HomeDeveloperConsoleDialogContentProps = {
  player: Player;
  onClose: () => void;
  onSubmit: (nextPlayer: Partial<Player>) => void;
};
