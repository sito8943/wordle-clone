import { useState } from "react";
import { EditableProfileCard, ProfileCard } from "../components/ProfileCard";
import { usePlayer } from "../providers";

const Profile = () => {
  const { player, updatePlayer } = usePlayer();

  const [edit, setEdit] = useState(false);

  const onSubmit = (name: string) => {
    updatePlayer(name);
    setEdit(false);
  };

  return (
    <main className="flex flex-col items-center justify-center py-20 gap-10">
      <div className="flex gap-4 items-center">
        <h2 className="text-2xl font-bold">Profile</h2>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => setEdit(!edit)}
        >
          {edit ? "Cancel" : "Edit"}
        </button>
      </div>
      {edit ? (
        <EditableProfileCard onSubmit={onSubmit} {...player} />
      ) : (
        <ProfileCard {...player} />
      )}
    </main>
  );
};

export default Profile;
