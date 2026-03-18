import { useMemo, type JSX } from "react";
import { ProfileViewContext } from "./ProfileViewContext";
import type { ProfileViewProviderProps } from "./types";
import { useProfileController } from "../hooks";

const ProfileViewProvider = ({
  children,
}: ProfileViewProviderProps): JSX.Element => {
  const controller = useProfileController();

  const value = useMemo(
    () => ({
      controller,
    }),
    [controller],
  );

  return (
    <ProfileViewContext.Provider value={value}>
      {children}
    </ProfileViewContext.Provider>
  );
};

export { ProfileViewProvider };
