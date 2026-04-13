import { useCallback, useEffect, useRef, useState } from "react";
import type { AnimatedPresenceResult } from "./types";

const useAnimatedPresence = (
  visible: boolean,
  exitDurationMs: number,
): AnimatedPresenceResult => {
  const [shouldRender, setShouldRender] = useState(visible);
  const [isExiting, setIsExiting] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const clearPending = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (visible) {
      clearPending();
      setIsExiting(false);
      setShouldRender(true);
    } else if (shouldRender) {
      setIsExiting(true);
      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = null;
        setIsExiting(false);
        setShouldRender(false);
      }, exitDurationMs);
    }
  }, [visible, exitDurationMs, clearPending, shouldRender]);

  useEffect(() => clearPending, [clearPending]);

  return { shouldRender, isExiting };
};

export default useAnimatedPresence;
