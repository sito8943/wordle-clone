import { getStreakScoreMultiplier } from "@domain/wordle";
import { Popup } from "@components/Popup";
import Fire from "./Fire";
import { useTranslation } from "@i18n";
import type { FireStreakProps } from "./types";
import { sanitizeCounter } from "./utils";

const toTooltipNumber = (value: number): string => {
  const roundedValue = Math.round(value * 10) / 10;
  const minimumFractionDigits = Number.isInteger(roundedValue) ? 0 : 1;

  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits,
    maximumFractionDigits: 1,
  }).format(roundedValue);
};

const FireStreak = ({
  streak,
  size = "md",
  noLabel = false,
  className = "",
  showScoreBonusPopup = false,
}: FireStreakProps) => {
  const { t } = useTranslation();
  const safeStreak = sanitizeCounter(streak);
  const showFlame = safeStreak >= 2;

  const streakMultiplier = getStreakScoreMultiplier(safeStreak);
  const streakBonusPercent = Math.max(0, (streakMultiplier - 1) * 100);
  const streakScoreBonusTooltip = t("common.streakScoreBonusTooltip", {
    bonusPercent: toTooltipNumber(streakBonusPercent),
  });

  const sizeClassName = size === "sm" ? "py-0.5 text-xs" : "py-1";
  const iconSize = size === "sm" ? 16 : 20;
  const label = noLabel
    ? String(safeStreak)
    : t("common.streakLabel", { count: safeStreak });

  const streakBadge = (
    <div
      title={showScoreBonusPopup ? undefined : label}
      aria-label={label}
      className={[
        "inline-flex items-center cursor-help gap-1.5 rounded-full font-semibold tabular-nums",
        showScoreBonusPopup ? "outline-none" : "",
        showScoreBonusPopup
          ? "transition-colors hover:bg-amber-500/10 dark:hover:bg-amber-300/10 focus-visible:ring-2 focus-visible:ring-primary/40"
          : "",
        sizeClassName,
        showFlame ? "text-amber-800" : "text-neutral-600",
        className,
      ].join(" ")}
    >
      {noLabel && showFlame && <Fire streak={safeStreak} size={iconSize} />}
      <span aria-hidden="true">{label}</span>
      {!noLabel && showFlame && <Fire streak={safeStreak} size={iconSize} />}
    </div>
  );

  if (!showScoreBonusPopup) {
    return streakBadge;
  }

  return <Popup content={streakScoreBonusTooltip}>{streakBadge}</Popup>;
};

export default FireStreak;
