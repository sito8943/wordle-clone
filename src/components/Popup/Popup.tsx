import {
  cloneElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type JSX,
} from "react";
import { createPortal } from "react-dom";
import { usePopupPortalTarget } from "@providers/Popup";
import {
  DEFAULT_POPUP_OFFSET_PX,
  POPUP_ENTER_DURATION_MS,
  POPUP_EXIT_DURATION_MS,
  POPUP_VIEWPORT_MARGIN_PX,
} from "./constants";
import type {
  PopupCoordinates,
  PopupMotionState,
  PopupProps,
  PopupTriggerProps,
} from "./types";
import { clamp, isInteractiveTagName, shouldSkipPopupMotion } from "./utils";

const Popup = ({
  content,
  children,
  disabled = false,
  placement = "bottom",
  offsetPx = DEFAULT_POPUP_OFFSET_PX,
  panelClassName = "",
}: PopupProps): JSX.Element => {
  const popupId = useId();
  const portalTarget = usePopupPortalTarget();
  const triggerRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const openedAtRef = useRef<number>(0);
  const [isPinned, setIsPinned] = useState(false);
  const [coordinates, setCoordinates] = useState<PopupCoordinates>({
    top: 0,
    left: 0,
    visible: false,
  });
  const [motionState, setMotionState] = useState<PopupMotionState>("hidden");
  const isOpen = !disabled && isPinned;

  const setTriggerReference = (node: HTMLElement | null) => {
    if (!node) {
      return;
    }

    triggerRef.current = node;
  };

  const updateCoordinates = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    const triggerElement = triggerRef.current;
    const panelElement = panelRef.current;
    if (!triggerElement || !panelElement) {
      return;
    }

    const triggerRect = triggerElement.getBoundingClientRect();
    const panelRect = panelElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const maxLeft = Math.max(
      POPUP_VIEWPORT_MARGIN_PX,
      viewportWidth - panelRect.width - POPUP_VIEWPORT_MARGIN_PX,
    );
    const left = clamp(triggerRect.left, POPUP_VIEWPORT_MARGIN_PX, maxLeft);

    const naturalTop =
      placement === "top"
        ? triggerRect.top - panelRect.height - offsetPx
        : triggerRect.bottom + offsetPx;
    const maxTop = Math.max(
      POPUP_VIEWPORT_MARGIN_PX,
      viewportHeight - panelRect.height - POPUP_VIEWPORT_MARGIN_PX,
    );
    const top = clamp(naturalTop, POPUP_VIEWPORT_MARGIN_PX, maxTop);

    setCoordinates({ top, left, visible: true });
  }, [offsetPx, placement]);

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    updateCoordinates();

    const frameId = window.requestAnimationFrame(updateCoordinates);
    window.addEventListener("resize", updateCoordinates);
    window.addEventListener("scroll", updateCoordinates, true);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", updateCoordinates);
      window.removeEventListener("scroll", updateCoordinates, true);
    };
  }, [isOpen, updateCoordinates]);

  useEffect(() => {
    if (isOpen) {
      setMotionState((current) =>
        current === "open" || current === "entering" ? current : "entering",
      );
      return;
    }

    setMotionState((current) =>
      current === "hidden" || current === "exiting" ? current : "exiting",
    );
  }, [isOpen]);

  useEffect(() => {
    if (motionState !== "entering" && motionState !== "exiting") {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const nextState: PopupMotionState =
      motionState === "entering" ? "open" : "hidden";
    if (shouldSkipPopupMotion()) {
      setMotionState(nextState);
      if (nextState === "hidden") {
        setCoordinates((current) =>
          current.visible ? { ...current, visible: false } : current,
        );
      }
      return;
    }

    const timeoutMs =
      motionState === "entering"
        ? POPUP_ENTER_DURATION_MS
        : POPUP_EXIT_DURATION_MS;
    const timeoutId = window.setTimeout(() => {
      setMotionState((current) =>
        current === motionState ? nextState : current,
      );
      if (nextState === "hidden") {
        setCoordinates((current) =>
          current.visible ? { ...current, visible: false } : current,
        );
      }
    }, timeoutMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [motionState]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    openedAtRef.current = Date.now();

    const handlePointerDown = (event: PointerEvent) => {
      if (Date.now() - openedAtRef.current < 80) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      const triggerElement = triggerRef.current;
      const panelElement = panelRef.current;
      if (!triggerElement || !panelElement) {
        return;
      }

      if (triggerElement.contains(target) || panelElement.contains(target)) {
        return;
      }

      setIsPinned(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      setIsPinned(false);
    };

    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      const triggerElement = triggerRef.current;
      const panelElement = panelRef.current;
      if (!triggerElement || !panelElement) {
        return;
      }

      if (triggerElement.contains(target) || panelElement.contains(target)) {
        return;
      }

      setIsPinned(false);
    };

    window.addEventListener("pointerdown", handlePointerDown, true);
    window.addEventListener("keydown", handleEscape);
    window.addEventListener("focusin", handleFocusIn);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, true);
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("focusin", handleFocusIn);
    };
  }, [isOpen]);

  const togglePinned = () => {
    if (disabled) {
      return;
    }

    setIsPinned((current) => !current);
  };

  const childWithRef = children as typeof children & {
    ref?: PopupTriggerProps["ref"];
  };
  const childRef = childWithRef.ref;
  const childRole = children.props.role;
  const hasExplicitInteractiveRole =
    typeof childRole === "string" &&
    [
      "button",
      "checkbox",
      "link",
      "menuitem",
      "option",
      "switch",
      "tab",
    ].includes(childRole);
  const hasNativeInteractiveSemantics =
    typeof children.type === "string" && isInteractiveTagName(children.type);
  const shouldSetButtonRole =
    !hasNativeInteractiveSemantics && !hasExplicitInteractiveRole;

  const triggerElement = cloneElement(children, {
    ref: (node: HTMLElement | null) => {
      setTriggerReference(node);

      if (!childRef) {
        return;
      }

      if (typeof childRef === "function") {
        childRef(node);
        return;
      }

      (childRef as { current: HTMLElement | null }).current = node;
    },
    role: shouldSetButtonRole ? "button" : childRole,
    "aria-controls": isOpen ? popupId : undefined,
    "aria-expanded": isOpen,
    "aria-haspopup": "dialog",
    "aria-describedby": isOpen ? popupId : undefined,
    tabIndex: children.props.tabIndex ?? 0,
    onClick: (event) => {
      children.props.onClick?.(event);

      if (event.defaultPrevented || disabled) {
        return;
      }

      setTriggerReference(event.currentTarget);
      togglePinned();
    },
    onKeyDown: (event) => {
      children.props.onKeyDown?.(event);
      if (event.defaultPrevented || disabled) {
        return;
      }

      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      setTriggerReference(event.currentTarget);
      togglePinned();
    },
  });

  const shouldRenderPopup =
    motionState !== "hidden" && portalTarget && typeof document !== "undefined";

  const motionClassName =
    motionState === "entering"
      ? placement === "top"
        ? "popup-enter-top"
        : "popup-enter-bottom"
      : motionState === "exiting"
        ? placement === "top"
          ? "popup-exit-top"
          : "popup-exit-bottom"
        : "";
  const originClassName =
    placement === "top" ? "origin-bottom-left" : "origin-top-left";

  return (
    <>
      {triggerElement}
      {shouldRenderPopup
        ? createPortal(
            <div
              ref={panelRef}
              id={popupId}
              role="tooltip"
              className={[
                "pointer-events-auto fixed z-50 w-max max-w-[min(24rem,calc(100vw-1rem))] rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-medium leading-5 text-neutral-800 shadow-xl dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100",
                originClassName,
                motionClassName,
                panelClassName,
              ].join(" ")}
              style={{
                top: coordinates.top,
                left: coordinates.left,
                visibility: coordinates.visible ? "visible" : "hidden",
              }}
              onAnimationEnd={() => {
                if (motionState === "entering") {
                  setMotionState("open");
                  return;
                }

                if (motionState === "exiting") {
                  setMotionState("hidden");
                  setCoordinates((current) =>
                    current.visible ? { ...current, visible: false } : current,
                  );
                }
              }}
            >
              {content}
            </div>,
            portalTarget,
          )
        : null}
    </>
  );
};

export default Popup;
