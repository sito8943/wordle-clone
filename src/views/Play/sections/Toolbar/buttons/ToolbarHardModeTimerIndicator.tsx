import type { JSX } from "react";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "@i18n";
import { usePlayView } from "@views/Play/providers";
import type { NativeKeyboardClockStyle } from "../types";
import {
  TOOLBAR_COMPACT_BUTTON_CLASS_NAME,
  TOOLBAR_ICON_CLASS_NAME,
} from "./constants";

const ToolbarHardModeTimerIndicator = (): JSX.Element | null => {
  const { t } = useTranslation();
  const {
    controller: {
      showHardModeTimer,
      hardModeSecondsLeft,
      hardModeTickPulse,
      hardModeClockBoostScale,
    },
  } = usePlayView();

  if (!showHardModeTimer) {
    return null;
  }

  return (
    <div
      role="status"
      data-tour="hard-mode-timer"
      aria-live="polite"
      aria-label={t("play.toolbar.insaneTimerAriaLabel", {
        seconds: hardModeSecondsLeft,
      })}
      className={`${TOOLBAR_COMPACT_BUTTON_CLASS_NAME} inline-flex items-center gap-2 rounded border px-3 py-2 text-sm font-bold border-blue-300 bg-blue-100/90 text-blue-900 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-200`}
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
          className={TOOLBAR_ICON_CLASS_NAME}
        />
      </span>
      <span>
        {t("play.toolbar.insaneTimerValue", {
          seconds: hardModeSecondsLeft,
        })}
      </span>
    </div>
  );
};

export default ToolbarHardModeTimerIndicator;
