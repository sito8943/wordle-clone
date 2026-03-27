import type { KeyboardEvent, RefObject } from "react";

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

export type PlayDeveloperConsoleDialogProps = {
  visible: boolean;
  onClose: () => void;
};
