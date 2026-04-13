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
        <p role="status" aria-live="polite" className="text-sm text-green-700">
          {savedMessage}
        </p>
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
