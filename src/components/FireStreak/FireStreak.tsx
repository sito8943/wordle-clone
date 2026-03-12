import Fire from "./Fire";
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

  const sizeClassName = size === "sm" ? "px-1.5 py-0.5 text-xs" : "px-2 py-1";
  const iconSize = size === "sm" ? 16 : 20;
  const label = `${noLabel ? "" : "Streak: "}${safeStreak}`;

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
      {noLabel && showFlame && <Fire streak={safeStreak} size={iconSize} />}
      <span>{label}</span>
      {!noLabel && showFlame && <Fire streak={safeStreak} size={iconSize} />}
    </span>
  );
};

export default FireStreak;
