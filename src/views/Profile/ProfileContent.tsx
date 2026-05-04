import type { JSX } from "react";
import { Link } from "react-router";
import { getChangelogRoute } from "@config/routes";
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
    <main className="page-centered gap-4 pb-[calc(env(safe-area-inset-bottom)+6rem)]">
      <DifficultyChangeDialog />
      <LanguageDialog />
      <div className="settings-entrance" style={{ animationDelay: "0ms" }}>
        <ProfileHeader />
        {env.appVersion && (
          <Link
            to={getChangelogRoute(env.appVersion)}
            className="m-auto text-xs text-gray-500 underline decoration-gray-400/70 underline-offset-2 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {env.appVersion}
          </Link>
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
