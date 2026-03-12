import { WORDLE_ANIMATIONS_DISABLED_CLASSNAME } from "./constants";

export const isBoolean = (value: unknown): value is boolean =>
  typeof value === "boolean";

export const applyAnimationsPreferenceToDocument = (
  animationsDisabled: boolean,
): void => {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.classList.toggle(
    WORDLE_ANIMATIONS_DISABLED_CLASSNAME,
    animationsDisabled,
  );
};
