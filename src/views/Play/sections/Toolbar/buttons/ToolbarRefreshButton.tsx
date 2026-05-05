import type { JSX } from "react";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@components";
import { WORDLE_MODE_IDS } from "@domain/wordle";
import { useTranslation } from "@i18n";
import { usePlayView } from "@views/Play/providers";
import type { NativeKeyboardClockStyle } from "../types";
import {
  TOOLBAR_COMPACT_BUTTON_CLASS_NAME,
  TOOLBAR_ICON_CLASS_NAME,
} from "./constants";

const ToolbarRefreshButton = (): JSX.Element | null => {
  const { t } = useTranslation();
  const {
    controller: {
      activeModeId,
      showRefreshAttention,
      refreshAttentionPulse,
      refreshAttentionScale,
      refreshBoard,
    },
  } = usePlayView();

  if (activeModeId === WORDLE_MODE_IDS.DAILY) {
    return null;
  }

  return (
    <span
      key={showRefreshAttention ? refreshAttentionPulse : "idle"}
      className={showRefreshAttention ? "boost-animation inline-flex" : "inline-flex"}
      style={
        showRefreshAttention
          ? ({
              "--boost-scale": refreshAttentionScale.toString(),
            } as NativeKeyboardClockStyle)
          : undefined
      }
    >
      <Button
        onClick={refreshBoard}
        aria-label={t("play.toolbar.refreshAriaLabel")}
        data-wordle-refresh="true"
        icon={faRotateRight}
        variant="ghost"
        iconClassName={TOOLBAR_ICON_CLASS_NAME}
        className={
          showRefreshAttention
            ? `${TOOLBAR_COMPACT_BUTTON_CLASS_NAME} text-amber-700 dark:text-amber-300`
            : TOOLBAR_COMPACT_BUTTON_CLASS_NAME
        }
        hideLabelOnMobile
      >
        {t("common.refresh")}
      </Button>
    </span>
  );
};

export default ToolbarRefreshButton;
