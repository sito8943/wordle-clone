import { Alert } from "@components";
import { EditableProfileCard, ProfileCard } from "@views/Profile/components";
import { useProfileView } from "@views/Profile/providers";

const ProfileEditorSection = () => {
  const {
    controller: {
      editing,
      toggleEditing,
      savedMessage,
      player,
      code,
      submitProfile,
    },
  } = useProfileView();

  return (
    <>
      {savedMessage ? (
        <div role="status" aria-live="polite">
          <Alert message={savedMessage} color="success" />
        </div>
      ) : null}
      {editing ? (
        <EditableProfileCard
          name={player.name}
          code={code}
          score={player.score}
          onSubmit={submitProfile}
          toggleEditing={toggleEditing}
        />
      ) : (
        <ProfileCard
          name={player.name}
          code={code}
          score={player.score}
          toggleEditing={toggleEditing}
        />
      )}
    </>
  );
};

export default ProfileEditorSection;
