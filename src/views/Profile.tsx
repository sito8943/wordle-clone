import { Button } from "../components";
import { EditableProfileCard, ProfileCard } from "../components/ProfileCard";
import { useProfileController } from "../hooks";

const Profile = () => {
  const {
    player,
    editing,
    savedMessage,
    toggleEditing,
    submitProfile,
    startAnimationsEnabled,
    toggleStartAnimations,
  } = useProfileController();

  return (
    <main className="flex flex-col items-center justify-center py-20 gap-10">
      <div className="flex gap-4 items-center">
        <h2 className="text-2xl font-bold">Profile</h2>
        <Button onClick={toggleEditing}>{editing ? "Cancel" : "Edit"}</Button>
        <Button
          onClick={toggleStartAnimations}
          variant="outline"
          color="neutral"
        >
          {startAnimationsEnabled ? "Anim: on" : "Anim: off"}
        </Button>
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
    </main>
  );
};

export default Profile;
