import { useCallback, useEffect, useRef, useState } from "react";
import type {
  DialogCloseAction,
  UseDialogCloseTransitionResult,
} from "./types";

const useDialogCloseTransition = (
  closeDurationMs: number,
): UseDialogCloseTransitionResult => {
  const [isClosing, setIsClosing] = useState(false);
  const closeTimeoutRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    },
    [],
  );

  const closeWithAction = useCallback(
    (action: DialogCloseAction) => {
      if (isClosing) {
        return;
      }

      setIsClosing(true);
      closeTimeoutRef.current = window.setTimeout(() => {
        action();
      }, closeDurationMs);
    },
    [closeDurationMs, isClosing],
  );

  return { isClosing, closeWithAction };
};

export default useDialogCloseTransition;
