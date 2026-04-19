import { faClock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo, type JSX } from "react";
import { useTranslation } from "react-i18next";
import type { NativeKeyboardClockStyle, ToolbarTimerProps } from "../types";

export const HardModeTimerIndicator = memo(
  ({
    showHardModeTimer,
    hardModeSecondsLeft,
    hardModeTickPulse,
    hardModeClockBoostScale,
  }: ToolbarTimerProps): JSX.Element | null => {
    const { t } = useTranslation();

    if (!showHardModeTimer) {
      return null;
    }

    return (
      <div
        role="status"
        aria-live="polite"
        aria-label={t("play.toolbar.insaneTimerAriaLabel", {
          seconds: hardModeSecondsLeft,
        })}
        className="mobile-compact-button inline-flex items-center gap-2 rounded border px-3 py-2 text-sm font-bold border-blue-300 bg-blue-100/90 text-blue-900 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-200"
      >
        <span
          key={hardModeTickPulse}
          className="boost-animation inline-flex"
          style={
            {
              "--boost-scale": hardModeClockBoostScale.toString(),
            } as NativeKeyboardClockStyle
          }
        >
          <FontAwesomeIcon
            icon={faClock}
            aria-hidden="true"
            className="text-lg"
          />
        </span>
        <span>
          {t("play.toolbar.insaneTimerValue", {
            seconds: hardModeSecondsLeft,
          })}
        </span>
      </div>
    );
  },
);
