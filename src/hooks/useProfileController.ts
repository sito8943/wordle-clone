import { useCallback, useState } from "react";
import { WORDLE_ANIMATIONS_DISABLED_STORAGE_KEY } from "../domain/wordle";
import { useLocalStorage } from "./useLocalStorage";
import { useApi, usePlayer } from "../providers";
import { normalizePlayerName } from "../providers/utils";

export default function useProfileController() {
  const { scoreClient } = useApi();
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
    async (name: string) => {
      const normalizedName = normalizePlayerName(name);
      if (normalizedName !== player.name) {
        const isAvailable = await scoreClient.isNickAvailable(normalizedName);
        if (!isAvailable) {
          return "Name is not available.";
        }
      }

      updatePlayer(normalizedName);
      setEditing(false);
      setSavedMessage("Configuration saved.");
      setTimeout(() => setSavedMessage(""), 1800);
      return null;
    },
    [player.name, scoreClient, updatePlayer],
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
