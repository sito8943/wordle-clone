import type { JSX } from "react";
import { Button } from "@components";
import {
  ROUTE_SEARCH_PARAMS,
  ROUTE_SEARCH_PARAM_VALUES,
} from "@config/routes";
import { WORDLE_MODE_IDS } from "@domain/wordle";
import { useTranslation } from "@i18n";
import { usePlayView } from "@views/Play/providers";
import { useLocation, useNavigate } from "react-router";
import { TOOLBAR_COMPACT_BUTTON_CLASS_NAME } from "./constants";

const ToolbarZenFocusButton = (): JSX.Element | null => {
  const { t } = useTranslation();
  const {
    controller: { activeModeId },
  } = usePlayView();
  const location = useLocation();
  const navigate = useNavigate();

  if (activeModeId !== WORDLE_MODE_IDS.ZEN) {
    return null;
  }

  const searchParams = new URLSearchParams(location.search);
  const zenFocusActive =
    searchParams.get(ROUTE_SEARCH_PARAMS.FOCUS) ===
    ROUTE_SEARCH_PARAM_VALUES.FOCUS_ON;
  const focusButtonLabel = zenFocusActive
    ? t("play.toolbar.focusOffButton")
    : t("play.toolbar.focusOnButton");
  const focusButtonAriaLabel = zenFocusActive
    ? t("play.toolbar.focusOffAriaLabel")
    : t("play.toolbar.focusOnAriaLabel");

  const toggleZenFocus = () => {
    const nextSearchParams = new URLSearchParams(location.search);

    if (zenFocusActive) {
      nextSearchParams.delete(ROUTE_SEARCH_PARAMS.FOCUS);
    } else {
      nextSearchParams.set(
        ROUTE_SEARCH_PARAMS.FOCUS,
        ROUTE_SEARCH_PARAM_VALUES.FOCUS_ON,
      );
    }

    const nextSearch = nextSearchParams.toString();
    navigate({
      pathname: location.pathname,
      search: nextSearch.length > 0 ? `?${nextSearch}` : "",
    });
  };

  return (
    <Button
      onClick={toggleZenFocus}
      aria-label={focusButtonAriaLabel}
      variant="ghost"
      color="warning"
      className={TOOLBAR_COMPACT_BUTTON_CLASS_NAME}
    >
      {focusButtonLabel}
    </Button>
  );
};

export default ToolbarZenFocusButton;
