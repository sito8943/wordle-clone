import Fire from "./Fire";
import { useTranslation } from "@i18n";
import type { FireStreakProps } from "./types";
import { sanitizeCounter } from "./utils";

const FireStreak = ({
  streak,
  size = "md",
  noLabel = false,
  className = "",
}: FireStreakProps) => {
  const { t } = useTranslation();
  const safeStreak = sanitizeCounter(streak);
  const showFlame = safeStreak >= 2;

  const sizeClassName = size === "sm" ? "py-0.5 text-xs" : "py-1";
  const iconSize = size === "sm" ? 16 : 20;
  const label = noLabel
    ? String(safeStreak)
    : t("common.streakLabel", { count: safeStreak });

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
      <span aria-hidden="true">{label}</span>
      {!noLabel && showFlame && <Fire streak={safeStreak} size={iconSize} />}
    </span>
  );
};

export default FireStreak;
