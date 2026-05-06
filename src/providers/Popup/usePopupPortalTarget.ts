import { useContext } from "react";
import { PopupContext } from "./PopupContext";

const usePopupPortalTarget = (): HTMLElement | null => {
  const context = useContext(PopupContext);

  if (context?.portalTarget) {
    return context.portalTarget;
  }

  if (typeof document === "undefined") {
    return null;
  }

  return document.body;
};

export { usePopupPortalTarget };
