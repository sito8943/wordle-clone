import { memo, type JSX } from "react";
import { useTranslation } from "react-i18next";
import type { HardModeProgressProps } from "../types";

export const HardModeProgressBar = memo(
  ({
    showHardModeFinalStretchBar,
    hardModeSecondsLeft,
    hardModeFinalStretchProgressPercent,
  }: HardModeProgressProps): JSX.Element | null => {
    const { t } = useTranslation();

    if (!showHardModeFinalStretchBar) {
      return null;
    }

    return (
      <div
        role="progressbar"
        aria-label={t("play.sections.insaneCountdownAriaLabel")}
        aria-valuemin={0}
        aria-valuemax={15}
        aria-valuenow={hardModeSecondsLeft}
        className="w-full max-w-md"
      >
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-blue-200/80 dark:bg-blue-950/50">
          <div
            className="h-full origin-left rounded-full bg-blue-500 transition-transform duration-1000 ease-linear dark:bg-blue-400"
            style={{
              transform: `scaleX(${hardModeFinalStretchProgressPercent / 100})`,
            }}
          />
        </div>
      </div>
    );
  },
);
