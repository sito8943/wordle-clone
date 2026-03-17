import { EditableProfileCard, ProfileCard } from "@views/Profile/components";
import type { ProfileEditorSectionProps } from "./types";

const ProfileEditorSection = ({
  editing,
  savedMessage,
  name,
  score,
  onSubmit,
}: ProfileEditorSectionProps) => {
  return (
    <>
      {savedMessage ? (
        <p role="status" aria-live="polite" className="text-sm text-green-700">
          {savedMessage}
        </p>
      ) : null}
      {editing ? (
        <EditableProfileCard name={name} score={score} onSubmit={onSubmit} />
      ) : (
        <ProfileCard name={name} score={score} />
      )}
    </>
  );
};

export default ProfileEditorSection;
