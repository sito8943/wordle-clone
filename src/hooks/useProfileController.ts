import { useCallback, useState } from "react";
import { usePlayer } from "../providers";

export default function useProfileController() {
  const { player, updatePlayer } = usePlayer();

  const [editing, setEditing] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  const toggleEditing = useCallback(() => {
    setEditing((previous) => !previous);
  }, []);

  const submitProfile = useCallback(
    (name: string) => {
      updatePlayer(name);
      setEditing(false);
      setSavedMessage("Configuration saved.");
      setTimeout(() => setSavedMessage(""), 1800);
    },
    [updatePlayer],
  );

  return {
    player,
    editing,
    savedMessage,
    toggleEditing,
    submitProfile,
  };
}
