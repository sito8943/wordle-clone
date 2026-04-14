import type { JSX } from "react";
import { env } from "@config/env";
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
    <main className="page-centered gap-4">
      <DifficultyChangeDialog />
      <LanguageDialog />
      <div className="settings-entrance" style={{ animationDelay: "0ms" }}>
        <ProfileHeader />
        {env.appVersion && (
          <span
            className="text-xs text-gray-500 dark:text-gray-400 m-auto"
            aria-hidden="true"
          >
            {env.appVersion}
          </span>
        )}
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

export default ProfileContent;
