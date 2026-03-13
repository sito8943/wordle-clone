import { useCallback, useState } from "react";
import type { PersistedGameState } from "../domain/wordle";
import {
  clearPersistedGameState,
  readPersistedGameState,
} from "../domain/wordle";
import { useAnimationsPreference } from "./useAnimationsPreference";
import { useThemePreference, type ThemePreference } from "./useThemePreference";
import { useApi, usePlayer } from "../providers";
import { normalizePlayerName } from "../providers/utils";
import type { PlayerDifficulty } from "../providers/types";

const hasActivePersistedGame = (value: unknown): boolean => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const maybeState = value as Partial<PersistedGameState>;

  return (
    maybeState.gameOver === false &&
    Array.isArray(maybeState.guesses) &&
    maybeState.guesses.length > 0
  );
};

export default function useProfileController() {
  const { scoreClient } = useApi();
  const { player, updatePlayer, updatePlayerDifficulty } = usePlayer();
  const { startAnimationsEnabled, toggleAnimationsDisabled } =
    useAnimationsPreference();
  const { themePreference, setThemePreference } = useThemePreference();

  const [editing, setEditing] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [pendingDifficulty, setPendingDifficulty] =
    useState<PlayerDifficulty | null>(null);

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

  const changeDifficulty = useCallback(
    (nextDifficulty: PlayerDifficulty) => {
      if (nextDifficulty === player.difficulty) {
        return;
      }

      const persistedState = readPersistedGameState();
      if (hasActivePersistedGame(persistedState)) {
        setPendingDifficulty(nextDifficulty);
        return;
      }

      updatePlayerDifficulty(nextDifficulty);
    },
    [player.difficulty, updatePlayerDifficulty],
  );

  const confirmDifficultyChange = useCallback(() => {
    if (!pendingDifficulty) {
      return;
    }

    clearPersistedGameState();
    updatePlayerDifficulty(pendingDifficulty);
    setPendingDifficulty(null);
  }, [pendingDifficulty, updatePlayerDifficulty]);

  const cancelDifficultyChange = useCallback(() => {
    setPendingDifficulty(null);
  }, []);

  const isDifficultyChangeConfirmationOpen = pendingDifficulty !== null;

  const pendingDifficultyValue = pendingDifficulty ?? player.difficulty;

  const pendingDifficultyLabel = useCallback(
    (difficulty: PlayerDifficulty): string => {
      if (difficulty === "easy") {
        return "Easy";
      }

      if (difficulty === "hard") {
        return "Hard";
      }

      return "Normal";
    },
    [],
  );

  return {
    player,
    difficulty: player.difficulty,
    pendingDifficulty: pendingDifficultyValue,
    editing,
    savedMessage,
    toggleEditing,
    submitProfile,
    startAnimationsEnabled,
    toggleStartAnimations,
    themePreference,
    changeThemePreference,
    changeDifficulty,
    isDifficultyChangeConfirmationOpen,
    confirmDifficultyChange,
    cancelDifficultyChange,
    pendingDifficultyLabel,
  };
}
