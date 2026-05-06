import { POPUP_ANIMATIONS_DISABLED_CLASSNAME } from "./constants";

export const clamp = (
  value: number,
  minValue: number,
  maxValue: number,
): number => Math.min(maxValue, Math.max(minValue, value));

const INTERACTIVE_TAG_NAMES = new Set([
  "a",
  "button",
  "input",
  "select",
  "textarea",
  "summary",
]);

export const isInteractiveTagName = (tagName: string): boolean =>
  INTERACTIVE_TAG_NAMES.has(tagName.toLowerCase());

export const shouldSkipPopupMotion = (): boolean => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return true;
  }

  if (
    document.documentElement.classList.contains(
      POPUP_ANIMATIONS_DISABLED_CLASSNAME,
    )
  ) {
    return true;
  }

  if (typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};
