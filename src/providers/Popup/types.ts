import type { ReactNode } from "react";

export type PopupProviderProps = {
  children: ReactNode;
};

export type PopupPortalContextType = {
  portalTarget: HTMLElement | null;
};
