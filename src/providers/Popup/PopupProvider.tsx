import { useEffect, useMemo, useState, type JSX } from "react";
import {
  POPUP_PORTAL_MANAGED_ATTRIBUTE,
  POPUP_PORTAL_REF_COUNT_ATTRIBUTE,
  POPUP_PORTAL_ROOT_ID,
} from "./constants";
import { PopupContext } from "./PopupContext";
import type { PopupProviderProps } from "./types";

const getPortalRefCount = (portalTarget: HTMLElement): number => {
  const value = portalTarget.getAttribute(POPUP_PORTAL_REF_COUNT_ATTRIBUTE);
  const parsedValue = Number.parseInt(value ?? "0", 10);

  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 0;
};

const setPortalRefCount = (
  portalTarget: HTMLElement,
  refCount: number,
): void => {
  portalTarget.setAttribute(POPUP_PORTAL_REF_COUNT_ATTRIBUTE, String(refCount));
};

const incrementPortalRefCount = (portalTarget: HTMLElement): void => {
  setPortalRefCount(portalTarget, getPortalRefCount(portalTarget) + 1);
};

const decrementPortalRefCount = (portalTarget: HTMLElement): void => {
  const nextCount = Math.max(0, getPortalRefCount(portalTarget) - 1);
  setPortalRefCount(portalTarget, nextCount);
};

const isPortalTargetManagedByProvider = (portalTarget: HTMLElement): boolean =>
  portalTarget.getAttribute(POPUP_PORTAL_MANAGED_ATTRIBUTE) === "true";

const PopupProvider = ({ children }: PopupProviderProps): JSX.Element => {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    let resolvedPortalTarget = document.getElementById(POPUP_PORTAL_ROOT_ID);
    if (!resolvedPortalTarget) {
      resolvedPortalTarget = document.createElement("div");
      resolvedPortalTarget.id = POPUP_PORTAL_ROOT_ID;
      resolvedPortalTarget.setAttribute(POPUP_PORTAL_MANAGED_ATTRIBUTE, "true");
      document.body.appendChild(resolvedPortalTarget);
    }
    incrementPortalRefCount(resolvedPortalTarget);
    setPortalTarget(resolvedPortalTarget);

    return () => {
      decrementPortalRefCount(resolvedPortalTarget);

      if (
        isPortalTargetManagedByProvider(resolvedPortalTarget) &&
        getPortalRefCount(resolvedPortalTarget) === 0 &&
        resolvedPortalTarget.parentElement
      ) {
        resolvedPortalTarget.parentElement.removeChild(resolvedPortalTarget);
      }
    };
  }, []);

  const contextValue = useMemo(
    () => ({
      portalTarget,
    }),
    [portalTarget],
  );

  return (
    <PopupContext.Provider value={contextValue}>
      {children}
    </PopupContext.Provider>
  );
};

export { PopupProvider };
