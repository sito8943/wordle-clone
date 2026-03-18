import type { JSX } from "react";
import { ProfileViewProvider } from "./providers";
import {
  DifficultyChangeDialog,
  ProfileEditorSection,
  ProfileHeader,
  RecoverySection,
  SettingsSection,
} from "./sections";

const ProfileContent = (): JSX.Element => {
  return (
    <main className="page-centered gap-10">
      <DifficultyChangeDialog />
      <ProfileHeader />
      <ProfileEditorSection />
      <SettingsSection />
      <RecoverySection />
    </main>
  );
};

const Profile = (): JSX.Element => {
  return (
    <ProfileViewProvider>
      <ProfileContent />
    </ProfileViewProvider>
  );
};

export default Profile;
