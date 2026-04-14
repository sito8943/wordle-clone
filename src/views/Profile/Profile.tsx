import type { JSX } from "react";
import { ProfileViewProvider } from "./providers";
import ProfileContent from "./ProfileContent";

const Profile = (): JSX.Element => {
  return (
    <ProfileViewProvider>
      <ProfileContent />
    </ProfileViewProvider>
  );
};

export default Profile;
