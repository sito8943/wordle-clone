import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
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
  const countdown = useMemo(() => formatCountdown(remainingMs), [remainingMs]);

  useEffect(() => {
    setRemainingMs(millisUntilTarget);
  }, [millisUntilTarget]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (millisUntilTarget <= 0) {
      setRemainingMs(0);
      return;
    }

    const startedAt = Date.now();
    const initialRemainingMs = millisUntilTarget;
    const interval = window.setInterval(() => {
      const elapsedMs = Date.now() - startedAt;
      const nextRemainingMs = Math.max(0, initialRemainingMs - elapsedMs);

      setRemainingMs(nextRemainingMs);
      setIsTickAnimating(true);

      if (nextRemainingMs === 0) {
        window.clearInterval(interval);
      }
    }, 1_000);

    return () => window.clearInterval(interval);
  }, [millisUntilTarget, visible]);

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
      className={`flex items-center justify-center gap-2 rounded-lg bg-neutral-100 px-3 py-2 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 ${className}`.trim()}
    >
      {label ? (
        <span
          aria-live="polite"
          className={`inline-block font-mono tabular-nums ${labelClassName}`.trim()}
        >
          {label}
        </span>
      ) : null}
      <span
        aria-live="polite"
        className={`inline-block font-mono tabular-nums ${countdownClassName}`.trim()}
      >
        {countdown}
        <FontAwesomeIcon
          className={`ml-2 transition-all duration-100 ease-in-out ${
            isTickAnimating ? "scale-120 text-primary" : "scale-100"
          } ${iconClassName}`.trim()}
          icon={faClock}
        />
      </span>
    </div>
  );
};

export default CountdownBadge;
