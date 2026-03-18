import { useContext } from "react";
import { ProfileViewContext } from "./ProfileViewContext";
import type { ProfileViewContextValue } from "./types";

const useProfileView = (): ProfileViewContextValue => {
  const value = useContext(ProfileViewContext);

  if (!value) {
    throw new Error("useProfileView must be used within ProfileViewProvider.");
  }

  return value;
};

export { useProfileView };
