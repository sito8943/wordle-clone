import { createContext } from "react";
import type { PopupPortalContextType } from "./types";

export const PopupContext = createContext<PopupPortalContextType | undefined>(
  undefined,
);
