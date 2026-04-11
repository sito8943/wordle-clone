import type { JSX } from "react";
import { ProfileViewProvider } from "./providers";
import {
  DifficultyChangeDialog,
  LanguageDialog,
  ProfileEditorSection,
  ProfileHeader,
  RecoverySection,
  SettingsSection,
} from "./sections";

const ProfileContent = (): JSX.Element => {
  return (
    <main className="page-centered gap-10">
      <DifficultyChangeDialog />
      <LanguageDialog />
      <div className="settings-entrance" style={{ animationDelay: "0ms" }}>
        <ProfileHeader />
      </div>
      <div className="settings-entrance" style={{ animationDelay: "80ms" }}>
        <ProfileEditorSection />
      </div>
      <div className="settings-entrance" style={{ animationDelay: "160ms" }}>
        <SettingsSection />
      </div>
      <div className="settings-entrance" style={{ animationDelay: "240ms" }}>
        <RecoverySection />
      </div>
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
