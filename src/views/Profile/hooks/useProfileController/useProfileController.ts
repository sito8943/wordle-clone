import { useCallback, useEffect, useState } from "react";
import { i18n } from "@i18n";
import {
  clearPersistedGameState,
  readPersistedGameState,
  type PlayerDifficulty,
  type PlayerKeyboardPreference,
} from "@domain/wordle";
import { useApi, usePlayer } from "@providers";
import { normalizePlayerName } from "@providers/Player/utils";

import { PROFILE_SAVED_MESSAGE_VISIBILITY_DURATION_MS } from "./constants";
import { hasActivePersistedGame } from "./utils";
import { useAnimationsPreference, useThemePreference } from "@hooks";
import type { ThemePreference } from "@hooks/useThemePreference";

export default function useProfileController() {
  const { scoreClient } = useApi();
  const {
    player,
    recoverPlayer,
    refreshCurrentPlayerProfile,
    updatePlayer,
    updatePlayerDifficulty,
    updatePlayerKeyboardPreference,
  } = usePlayer();
  const { startAnimationsEnabled, toggleAnimationsDisabled } =
    useAnimationsPreference();
  const { themePreference, setThemePreference } = useThemePreference();

  const [editing, setEditing] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [pendingDifficulty, setPendingDifficulty] =
    useState<PlayerDifficulty | null>(null);

  useEffect(() => {
    if (player.name.length === 0 || player.code.length > 0) {
      return;
    }

    void refreshCurrentPlayerProfile().catch(() => undefined);
  }, [player.code.length, player.name.length, refreshCurrentPlayerProfile]);

  const toggleEditing = useCallback(() => {
    setEditing((previous) => !previous);
  }, []);

  const submitProfile = useCallback(
    async (name: string) => {
      const normalizedName = normalizePlayerName(name);
      if (normalizedName !== player.name) {
        const isAvailable = await scoreClient.isNickAvailable(normalizedName);
        if (!isAvailable) {
          return i18n.t("profile.nameNotAvailable");
        }
      }

      if (normalizedName !== player.name || player.code.length === 0) {
        try {
          await updatePlayer(normalizedName);
        } catch (error) {
          return error instanceof Error
            ? error.message
            : i18n.t("profile.nameNotAvailable");
        }
      }

      setEditing(false);
      setSavedMessage(i18n.t("profile.savedMessage"));
      setTimeout(
        () => setSavedMessage(""),
        PROFILE_SAVED_MESSAGE_VISIBILITY_DURATION_MS,
      );
      return null;
    },
    [player.code.length, player.name, scoreClient, updatePlayer],
  );

  const submitRecoveryCode = useCallback(
    async (code: string) => {
      if (code.trim().length === 0) {
        return i18n.t("profile.recovery.emptyCodeError");
      }

      try {
        await recoverPlayer(code);
      } catch (error) {
        return error instanceof Error
          ? error.message
          : i18n.t("profile.recovery.emptyCodeError");
      }

      setEditing(false);
      setSavedMessage(i18n.t("profile.recovery.successMessage"));
      setTimeout(
        () => setSavedMessage(""),
        PROFILE_SAVED_MESSAGE_VISIBILITY_DURATION_MS,
      );
      return null;
    },
    [recoverPlayer],
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

  const changeKeyboardPreference = useCallback(
    (nextPreference: PlayerKeyboardPreference) => {
      if (nextPreference === player.keyboardPreference) {
        return;
      }

      updatePlayerKeyboardPreference(nextPreference);
    },
    [player.keyboardPreference, updatePlayerKeyboardPreference],
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

  return {
    player,
    difficulty: player.difficulty,
    pendingDifficulty: pendingDifficultyValue,
    editing,
    savedMessage,
    toggleEditing,
    submitProfile,
    submitRecoveryCode,
    code: player.code,
    startAnimationsEnabled,
    toggleStartAnimations,
    themePreference,
    changeThemePreference,
    keyboardPreference: player.keyboardPreference,
    changeKeyboardPreference,
    changeDifficulty,
    isDifficultyChangeConfirmationOpen,
    confirmDifficultyChange,
    cancelDifficultyChange,
  };
}
