import {
  DIALOG_BACKDROP_ENTER_ANIMATION_CLASS,
  DIALOG_BACKDROP_EXIT_ANIMATION_CLASS,
  DIALOG_PANEL_ENTER_ANIMATION_CLASS,
  DIALOG_PANEL_EXIT_ANIMATION_CLASS,
} from "./constant";
import type { DialogTransitionClasses } from "./types";

export const getDialogTransitionClasses = (
  isClosing: boolean,
): DialogTransitionClasses => ({
  backdropAnimationClassName: isClosing
    ? DIALOG_BACKDROP_EXIT_ANIMATION_CLASS
    : DIALOG_BACKDROP_ENTER_ANIMATION_CLASS,
  panelAnimationClassName: isClosing
    ? DIALOG_PANEL_EXIT_ANIMATION_CLASS
    : DIALOG_PANEL_ENTER_ANIMATION_CLASS,
});
