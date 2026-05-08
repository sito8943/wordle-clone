import { useCallback, useEffect, useRef, useState, type JSX } from "react";
import { createPortal } from "react-dom";
import { Button } from "@components";
import { ROUTE_SEARCH_PARAMS, ROUTE_SEARCH_PARAM_VALUES } from "@config/routes";
import { WORDLE_MODE_IDS } from "@domain/wordle";
import { useTranslation } from "@i18n";
import { usePlayView } from "@views/Play/providers";
import { useLocation, useNavigate } from "react-router";
import {
  TOOLBAR_COMPACT_BUTTON_CLASS_NAME,
  ZEN_FOCUS_FLOATING_APPEAR_DELAY_MS,
  ZEN_FOCUS_FLOATING_APPEAR_DURATION_MS,
  ZEN_FOCUS_FALLBACK_BUTTON_HEIGHT,
  ZEN_FOCUS_FALLBACK_BUTTON_WIDTH,
  ZEN_FOCUS_FLOATING_BOUNDS_PADDING,
  ZEN_FOCUS_FLOATING_DEFAULT_X,
  ZEN_FOCUS_FLOATING_DEFAULT_Y,
} from "./constants";

const ToolbarZenFocusButton = (): JSX.Element | null => {
  const { t } = useTranslation();
  const {
    controller: { activeModeId },
  } = usePlayView();
  const location = useLocation();
  const navigate = useNavigate();
  const isZenMode = activeModeId === WORDLE_MODE_IDS.ZEN;
  const [floatingPosition, setFloatingPosition] = useState({
    x: ZEN_FOCUS_FLOATING_DEFAULT_X,
    y: ZEN_FOCUS_FLOATING_DEFAULT_Y,
  });
  const [floatingVisible, setFloatingVisible] = useState(false);
  const floatingContainerRef = useRef<HTMLDivElement | null>(null);

  const searchParams = new URLSearchParams(location.search);
  const zenFocusActive =
    isZenMode &&
    searchParams.get(ROUTE_SEARCH_PARAMS.FOCUS) ===
      ROUTE_SEARCH_PARAM_VALUES.FOCUS_ON;
  const focusButtonLabel = zenFocusActive
    ? t("play.toolbar.focusOffButton")
    : t("play.toolbar.focusOnButton");
  const focusButtonAriaLabel = zenFocusActive
    ? t("play.toolbar.focusOffAriaLabel")
    : t("play.toolbar.focusOnAriaLabel");

  const clampFloatingPosition = useCallback((x: number, y: number) => {
    if (typeof window === "undefined") {
      return { x, y };
    }

    const containerRect = floatingContainerRef.current?.getBoundingClientRect();
    const buttonWidth = containerRect?.width ?? ZEN_FOCUS_FALLBACK_BUTTON_WIDTH;
    const buttonHeight =
      containerRect?.height ?? ZEN_FOCUS_FALLBACK_BUTTON_HEIGHT;
    const minX = ZEN_FOCUS_FLOATING_BOUNDS_PADDING;
    const minY = ZEN_FOCUS_FLOATING_BOUNDS_PADDING;
    const maxX = Math.max(
      minX,
      window.innerWidth - buttonWidth - ZEN_FOCUS_FLOATING_BOUNDS_PADDING,
    );
    const maxY = Math.max(
      minY,
      window.innerHeight - buttonHeight - ZEN_FOCUS_FLOATING_BOUNDS_PADDING,
    );

    return {
      x: Math.min(Math.max(minX, x), maxX),
      y: Math.min(Math.max(minY, y), maxY),
    };
  }, []);

  useEffect(() => {
    if (!zenFocusActive || typeof window === "undefined") {
      return;
    }

    const handleResize = () => {
      setFloatingPosition((current) =>
        clampFloatingPosition(current.x, current.y),
      );
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [clampFloatingPosition, zenFocusActive]);

  useEffect(() => {
    if (!zenFocusActive) {
      setFloatingVisible(false);
      return;
    }

    if (typeof window === "undefined") {
      setFloatingVisible(true);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setFloatingVisible(true);
    }, ZEN_FOCUS_FLOATING_APPEAR_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [zenFocusActive]);

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

  const handleFocusButtonClick = () => {
    toggleZenFocus();
  };

  if (!isZenMode) {
    return null;
  }

  if (zenFocusActive && typeof document !== "undefined") {
    return createPortal(
      <div
        ref={floatingContainerRef}
        className={`fixed z-40 transition-[opacity,transform] ease-out ${
          floatingVisible
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 -translate-y-1 scale-95 pointer-events-none"
        }`}
        style={{
          right: `${floatingPosition.x}px`,
          top: `${floatingPosition.y}px`,
          transitionDuration: `${ZEN_FOCUS_FLOATING_APPEAR_DURATION_MS}ms`,
        }}
      >
        <Button
          onClick={handleFocusButtonClick}
          aria-label={focusButtonAriaLabel}
          variant="ghost"
          color="warning"
          className={TOOLBAR_COMPACT_BUTTON_CLASS_NAME}
        >
          {focusButtonLabel}
        </Button>
      </div>,
      document.body,
    );
  }

  return (
    <Button
      onClick={handleFocusButtonClick}
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
