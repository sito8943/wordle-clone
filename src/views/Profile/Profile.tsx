import {
  DifficultyChangeDialog,
  ProfileEditorSection,
  ProfileHeader,
  SettingsSection,
} from "./sections";
import { useProfileController } from "./hooks";

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

  const pendingDifficultyCopy = pendingDifficultyLabel(pendingDifficulty);

  return (
    <main className="page-centered gap-10">
      <DifficultyChangeDialog
        visible={isDifficultyChangeConfirmationOpen}
        pendingDifficultyLabel={pendingDifficultyCopy}
        onClose={cancelDifficultyChange}
        onConfirm={confirmDifficultyChange}
      />
      <ProfileHeader editing={editing} onToggleEditing={toggleEditing} />
      <ProfileEditorSection
        editing={editing}
        savedMessage={savedMessage}
        name={player.name}
        score={player.score}
        onSubmit={submitProfile}
      />
      <SettingsSection
        startAnimationsEnabled={startAnimationsEnabled}
        onToggleStartAnimations={toggleStartAnimations}
        themePreference={themePreference}
        onChangeThemePreference={changeThemePreference}
        keyboardPreference={keyboardPreference}
        onChangeKeyboardPreference={changeKeyboardPreference}
        difficulty={difficulty}
        onChangeDifficulty={changeDifficulty}
      />
    </main>
  );
};

export default Profile;
