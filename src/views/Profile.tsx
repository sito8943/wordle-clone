import { Button } from "../components";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { EditableProfileCard, ProfileCard } from "../components/ProfileCard";
import { useProfileController } from "../hooks";
import type { ThemePreference } from "../hooks/useThemePreference";
import type {
  PlayerDifficulty,
  PlayerKeyboardPreference,
} from "../providers/types";
import {
  DIFFICULTY_CHANGE_CANCEL_ACTION_LABEL,
  DIFFICULTY_CHANGE_CONFIRM_ACTION_LABEL,
  DIFFICULTY_CHANGE_CONFIRMATION_DESCRIPTION,
  DIFFICULTY_CHANGE_CONFIRMATION_TITLE,
  DIFFICULTY_CHANGE_DIALOG_TITLE_ID,
} from "./constants";

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
    keyboardPreference,
    changeKeyboardPreference,
    difficulty,
    pendingDifficulty,
    changeDifficulty,
    isDifficultyChangeConfirmationOpen,
    confirmDifficultyChange,
    cancelDifficultyChange,
    pendingDifficultyLabel,
  } = useProfileController();

  return (
    <main className="page-centered gap-10">
      {isDifficultyChangeConfirmationOpen && (
        <ConfirmationDialog
          title={DIFFICULTY_CHANGE_CONFIRMATION_TITLE}
          description={`${DIFFICULTY_CHANGE_CONFIRMATION_DESCRIPTION} New difficulty: ${pendingDifficultyLabel(
            pendingDifficulty,
          )}.`}
          confirmActionLabel={DIFFICULTY_CHANGE_CONFIRM_ACTION_LABEL}
          cancelActionLabel={DIFFICULTY_CHANGE_CANCEL_ACTION_LABEL}
          dialogTitleId={DIFFICULTY_CHANGE_DIALOG_TITLE_ID}
          onConfirm={confirmDifficultyChange}
          onCancel={cancelDifficultyChange}
        />
      )}
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
        <div className="flex gap-4 items-center flex-wrap">
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
        <div className="max-w-xl rounded-lg border border-neutral-300 bg-white/60 p-3 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800/40 dark:text-neutral-100">
          <div className="flex flex-col gap-2">
            <label htmlFor="keyboard-mode" className="text-sm font-semibold">
              Keyboard
            </label>
            <select
              id="keyboard-mode"
              aria-label="Keyboard mode"
              value={keyboardPreference}
              onChange={(event) =>
                changeKeyboardPreference(
                  event.target.value as PlayerKeyboardPreference,
                )
              }
              className="w-full rounded border border-neutral-300 bg-white px-2 py-1 text-sm text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
            >
              <option value="onscreen">On-screen keyboard</option>
              <option value="native">Device keyboard (mobile)</option>
            </select>
            <p className="text-xs text-neutral-600 dark:text-neutral-300">
              Device keyboard is shown on mobile. Desktop keeps the on-screen
              keyboard.
            </p>

            <label htmlFor="difficulty-mode" className="text-sm font-semibold">
              Difficulty
            </label>
            <select
              id="difficulty-mode"
              aria-label="Difficulty"
              value={difficulty}
              onChange={(event) =>
                changeDifficulty(event.target.value as PlayerDifficulty)
              }
              className="w-full rounded border border-neutral-300 bg-white px-2 py-1 text-sm text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
            >
              <option value="easy">Easy</option>
              <option value="normal">Normal</option>
              <option value="hard">Hard</option>
              <option value="insane">Insane</option>
            </select>
            <ul className="list-disc pl-5 text-sm text-neutral-700 dark:text-neutral-300">
              <li>Easy shows the word list.</li>
              <li>Normal hides the word list.</li>
              <li>Hard disables hints.</li>
              <li>Insane enables the timer.</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Profile;
