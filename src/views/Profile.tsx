import { Button } from "../components";
import { EditableProfileCard, ProfileCard } from "../components/ProfileCard";
import { useProfileController } from "../hooks";
import type { ThemePreference } from "../hooks/useThemePreference";

const Profile = () => {
  const {
    player,
    editing,
    savedMessage,
    toggleEditing,
    submitProfile,
    startAnimationsEnabled,
    toggleStartAnimations,
    themePreference,
    changeThemePreference,
  } = useProfileController();

  return (
    <main className="page-centered gap-10">
      <div className="flex gap-4 items-center flex-wrap justify-center">
        <h2 className="page-title">Profile</h2>
        <Button onClick={toggleEditing}>{editing ? "Cancel" : "Edit"}</Button>
      </div>
      {savedMessage && (
        <p role="status" aria-live="polite" className="text-sm text-green-700">
          {savedMessage}
        </p>
      )}
      {editing ? (
        <EditableProfileCard onSubmit={submitProfile} {...player} />
      ) : (
        <ProfileCard {...player} />
      )}
      <section id="settings" className="flex flex-col gap-4">
        <h2 className="page-title">Settings</h2>
        <div className="flex gap-4 items-center">
          <Button
            onClick={toggleStartAnimations}
            variant="outline"
            color="neutral"
          >
            {startAnimationsEnabled ? "Anim: on" : "Anim: off"}
          </Button>
          <label htmlFor="theme-mode" className="text-sm font-semibold">
            Theme
          </label>
          <select
            id="theme-mode"
            aria-label="Theme mode"
            value={themePreference}
            onChange={(event) =>
              changeThemePreference(event.target.value as ThemePreference)
            }
            className="rounded border border-neutral-300 bg-white px-2 py-1 text-sm text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </section>
    </main>
  );
};

export default Profile;
