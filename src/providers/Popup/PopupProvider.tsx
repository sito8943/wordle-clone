import { useEffect, useMemo, useState, type JSX } from "react";
import { POPUP_PORTAL_ROOT_ID } from "./constants";
import { PopupContext } from "./PopupContext";
import type { PopupProviderProps } from "./types";

const PopupProvider = ({ children }: PopupProviderProps): JSX.Element => {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const existingPortalTarget = document.getElementById(POPUP_PORTAL_ROOT_ID);
    if (existingPortalTarget) {
      setPortalTarget(existingPortalTarget as HTMLElement);
      return;
    }

    const createdPortalTarget = document.createElement("div");
    createdPortalTarget.id = POPUP_PORTAL_ROOT_ID;
    document.body.appendChild(createdPortalTarget);
    setPortalTarget(createdPortalTarget);

    return () => {
      if (createdPortalTarget.parentElement) {
        createdPortalTarget.parentElement.removeChild(createdPortalTarget);
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
