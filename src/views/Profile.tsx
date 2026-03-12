import { EditableProfileCard, ProfileCard } from "../components/ProfileCard";
import { useProfileController } from "../hooks";

const Profile = () => {
  const { player, editing, savedMessage, toggleEditing, submitProfile } =
    useProfileController();

  return (
    <main className="flex flex-col items-center justify-center py-20 gap-10">
      <div className="flex gap-4 items-center">
        <h2 className="text-2xl font-bold">Profile</h2>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={toggleEditing}
        >
          {editing ? "Cancel" : "Edit"}
        </button>
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
