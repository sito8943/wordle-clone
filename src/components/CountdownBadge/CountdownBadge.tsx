import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@utils/cn";
import { formatCountdown } from "./utils";
import type { CountdownBadgeProps } from "./types";

const CountdownBadge = ({
  visible = true,
  millisUntilTarget,
  label,
  className = "",
  labelClassName = "",
  countdownClassName = "",
  iconClassName = "",
}: CountdownBadgeProps) => {
  const [remainingMs, setRemainingMs] = useState(millisUntilTarget);
  const [isTickAnimating, setIsTickAnimating] = useState(false);
  const targetTimestampRef = useRef(
    Date.now() + Math.max(0, millisUntilTarget),
  );
  const countdown = useMemo(() => formatCountdown(remainingMs), [remainingMs]);
  const hasTimeRemaining = millisUntilTarget > 0;

  useEffect(() => {
    const nextRemainingMs = Math.max(0, millisUntilTarget);
    targetTimestampRef.current = Date.now() + nextRemainingMs;
    setRemainingMs(nextRemainingMs);
  }, [millisUntilTarget]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (!hasTimeRemaining) {
      setRemainingMs(0);
      return;
    }

    const interval = window.setInterval(() => {
      const nextRemainingMs = Math.max(
        0,
        targetTimestampRef.current - Date.now(),
      );

      setRemainingMs(nextRemainingMs);
      setIsTickAnimating(true);

      if (nextRemainingMs === 0) {
        window.clearInterval(interval);
      }
    }, 1_000);

    return () => window.clearInterval(interval);
  }, [hasTimeRemaining, visible]);

  useEffect(() => {
    if (!isTickAnimating) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setIsTickAnimating(false);
    }, 320);

    return () => window.clearTimeout(timeout);
  }, [isTickAnimating]);

  if (!visible) {
    return null;
  }

  return (
    <div
      className={cn(
        "m-0 flex items-center justify-center gap-2 rounded-lg bg-neutral-100 px-3 py-1 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
        className,
      )}
    >
      {label ? (
        <span
          aria-live="polite"
          className={cn(
            "inline-block font-mono tabular-nums max-sm:hidden",
            labelClassName,
          )}
        >
          {label}
        </span>
      ) : null}
      <span
        aria-live="polite"
        className={cn(
          "inline-block font-mono tabular-nums",
          countdownClassName,
        )}
      >
        {countdown}
        <FontAwesomeIcon
          className={cn(
            "ml-2 transition-all duration-100 ease-in-out",
            isTickAnimating ? "scale-120 text-primary" : "scale-100",
            iconClassName,
          )}
          icon={faClock}
        />
      </span>
    </div>
  );
};

export default CountdownBadge;
