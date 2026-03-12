import { useCallback, useState } from "react";
import useAnimationsPreference from "./useAnimationsPreference";
import {
  useThemePreference,
  type ThemePreference,
} from "./useThemePreference";
import { useApi, usePlayer } from "../providers";
import { normalizePlayerName } from "../providers/utils";

export default function useProfileController() {
  const { scoreClient } = useApi();
  const { player, updatePlayer } = usePlayer();
  const { startAnimationsEnabled, toggleAnimationsDisabled } =
    useAnimationsPreference();
  const { themePreference, setThemePreference } = useThemePreference();

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
    toggleAnimationsDisabled();
  }, [toggleAnimationsDisabled]);

  const changeThemePreference = useCallback(
    (nextPreference: ThemePreference) => {
      setThemePreference(nextPreference);
    },
    [setThemePreference],
  );

  return {
    player,
    editing,
    savedMessage,
    toggleEditing,
    submitProfile,
    startAnimationsEnabled,
    toggleStartAnimations,
    themePreference,
    changeThemePreference,
  };
}
