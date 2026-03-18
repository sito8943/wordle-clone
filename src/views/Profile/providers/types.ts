import type { ReactNode } from "react";
import type { useProfileController } from "../hooks";

export type ProfileControllerState = ReturnType<typeof useProfileController>;

export type ProfileViewContextValue = {
  controller: ProfileControllerState;
};

export type ProfileViewProviderProps = {
  children: ReactNode;
};
