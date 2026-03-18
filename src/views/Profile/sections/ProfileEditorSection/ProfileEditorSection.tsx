import { EditableProfileCard, ProfileCard } from "@views/Profile/components";
import { useProfileView } from "@views/Profile/providers";

const ProfileEditorSection = () => {
  const {
    controller: { editing, savedMessage, player, code, submitProfile },
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
        />
      ) : (
        <ProfileCard name={player.name} code={code} score={player.score} />
      )}
    </>
  );
};

export default ProfileEditorSection;
