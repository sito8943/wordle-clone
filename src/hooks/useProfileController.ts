import { useCallback, useState } from "react";
import { WORDLE_ANIMATIONS_DISABLED_STORAGE_KEY } from "../domain/wordle";
import useLocalStorage from "./useLocalStorage";
import { usePlayer } from "../providers";

export default function useProfileController() {
  const { player, updatePlayer } = usePlayer();
  const [animationsDisabled, setAnimationsDisabled] = useLocalStorage<boolean>(
    WORDLE_ANIMATIONS_DISABLED_STORAGE_KEY,
    false,
  );

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

  const toggleStartAnimations = useCallback(() => {
    setAnimationsDisabled((prev) => !prev);
  }, [setAnimationsDisabled]);

  return {
    player,
    editing,
    savedMessage,
    toggleEditing,
    submitProfile,
    startAnimationsEnabled: !animationsDisabled,
    toggleStartAnimations,
  };
}
