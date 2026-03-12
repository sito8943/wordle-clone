import { useId } from "react";
import type { FireStreakProps } from "./types";
import { sanitizeCounter } from "./utils";

const FireStreak = ({
  streak,
  size = "md",
  noLabel = false,
  className = "",
}: FireStreakProps) => {
  const safeStreak = sanitizeCounter(streak);
  const showFlame = safeStreak >= 2;

  const gradientId = useId().replace(/:/g, "");
  const innerGradientId = useId().replace(/:/g, "");

  const sizeClassName = size === "sm" ? "px-1.5 py-0.5 text-xs" : "px-2 py-1";
  const iconClassName = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const label = `${noLabel ? "" : "Streak: "}${safeStreak}`;

  const fire = (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-hidden="true"
      className={`${iconClassName} fire-streak-icon-active`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="55%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
        <linearGradient id={innerGradientId} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="100%" stopColor="#fef9c3" />
        </linearGradient>
      </defs>

      <path
        className="fire-shell"
        fill={`url(#${gradientId})`}
        d="M32 58c-10.7 0-19-7.8-19-18 0-8.9 6-15.7 11.4-21.8 3.8-4.2 7.3-8.1 8.3-13 .2-.9 1.3-1 1.8-.2 4.2 6.3 10.4 10 13.5 17.1A21.8 21.8 0 0 1 50 31c0 15.1-7.8 27-18 27Z"
      />
      <path
        className="fire-core"
        fill={`url(#${innerGradientId})`}
        d="M32 51.5c-5.8 0-10.2-4.3-10.2-10 0-4.6 2.8-8.2 5.3-11.3 1.9-2.3 3.6-4.4 4.2-7.1.1-.6 1-.7 1.3-.2 2.4 3.7 5.9 5.8 7.7 9.8.7 1.6 1.1 3.2 1.1 4.9 0 8-4.2 13.9-9.4 13.9Z"
      />
      <circle className="fire-ember fire-ember-1" cx="23" cy="39" r="2.1" />
      <circle className="fire-ember fire-ember-2" cx="42" cy="37" r="1.7" />
      <circle className="fire-ember fire-ember-3" cx="33" cy="30" r="1.4" />
    </svg>
  );

  return (
    <span
      title={label}
      aria-label={label}
      className={[
        "inline-flex items-center gap-1.5 rounded-full font-semibold tabular-nums",
        sizeClassName,
        showFlame ? "text-amber-800" : "text-neutral-600",
        className,
      ].join(" ")}
    >
      {noLabel && showFlame && fire}
      <span>{label}</span>
      {!noLabel && showFlame && fire}
    </span>
  );
};

export default FireStreak;
