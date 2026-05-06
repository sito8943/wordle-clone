import type { CSSProperties } from "react";
import {
  HIGHLIGHT_BORDER_COLOR,
  HIGHLIGHT_BOX_SHADOW,
  HIGHLIGHT_PADDING_PX,
  HIGHLIGHT_VIEWPORT_MARGIN_PX,
} from "./constants";

const clamp = (value: number, minValue: number, maxValue: number): number =>
  Math.min(maxValue, Math.max(minValue, value));

export const resolveHighlightStyle = (
  targetRect: DOMRect | null,
): CSSProperties | null => {
  if (!targetRect || typeof window === "undefined") {
    return null;
  }

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const left = clamp(
    targetRect.left - HIGHLIGHT_PADDING_PX,
    HIGHLIGHT_VIEWPORT_MARGIN_PX,
    Math.max(
      HIGHLIGHT_VIEWPORT_MARGIN_PX,
      viewportWidth - HIGHLIGHT_VIEWPORT_MARGIN_PX,
    ),
  );
  const top = clamp(
    targetRect.top - HIGHLIGHT_PADDING_PX,
    HIGHLIGHT_VIEWPORT_MARGIN_PX,
    Math.max(
      HIGHLIGHT_VIEWPORT_MARGIN_PX,
      viewportHeight - HIGHLIGHT_VIEWPORT_MARGIN_PX,
    ),
  );
  const right = clamp(
    targetRect.right + HIGHLIGHT_PADDING_PX,
    HIGHLIGHT_VIEWPORT_MARGIN_PX,
    Math.max(
      HIGHLIGHT_VIEWPORT_MARGIN_PX,
      viewportWidth - HIGHLIGHT_VIEWPORT_MARGIN_PX,
    ),
  );
  const bottom = clamp(
    targetRect.bottom + HIGHLIGHT_PADDING_PX,
    HIGHLIGHT_VIEWPORT_MARGIN_PX,
    Math.max(
      HIGHLIGHT_VIEWPORT_MARGIN_PX,
      viewportHeight - HIGHLIGHT_VIEWPORT_MARGIN_PX,
    ),
  );

  return {
    left,
    top,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
    boxShadow: HIGHLIGHT_BOX_SHADOW,
    borderColor: HIGHLIGHT_BORDER_COLOR,
  };
};

export const resolveTargetRect = (selector: string | null): DOMRect | null => {
  if (!selector || typeof document === "undefined") {
    return null;
  }

  const targetElement = document.querySelector<HTMLElement>(selector);
  if (!targetElement) {
    return null;
  }

  const style = window.getComputedStyle(targetElement);
  if (style.display === "none" || style.visibility === "hidden") {
    return null;
  }

  const targetRect = targetElement.getBoundingClientRect();
  if (targetRect.width <= 0 || targetRect.height <= 0) {
    return null;
  }

  return targetRect;
};
