import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { i18n } from "@i18n";
import { PROFILE_SAVED_MESSAGE_VISIBILITY_DURATION_MS } from "./constants";
import useProfileController from "./useProfileController";

const mockUseApi = vi.fn();
const mockUsePlayer = vi.fn();
const mockUseAnimationsPreference = vi.fn();
const mockUseThemePreference = vi.fn();
const mockUseSound = vi.fn();
const mockReadPersistedGameState = vi.fn();
const mockClearPersistedGameState = vi.fn();
const mockClearAllPersistedGameStates = vi.fn();

vi.mock("@providers", () => ({
  useApi: () => mockUseApi(),
  usePlayer: () => mockUsePlayer(),
}));

vi.mock("@hooks", () => ({
  useAnimationsPreference: () => mockUseAnimationsPreference(),
  useThemePreference: () => mockUseThemePreference(),
}));

vi.mock("@providers/Sound", () => ({
  useSound: () => mockUseSound(),
}));

vi.mock("@domain/wordle", async () => {
  const actual =
    await vi.importActual<typeof import("@domain/wordle")>("@domain/wordle");

  return {
    ...actual,
    readPersistedGameState: (...args: unknown[]) =>
      mockReadPersistedGameState(...args),
    clearPersistedGameState: (...args: unknown[]) =>
      mockClearPersistedGameState(...args),
    clearAllPersistedGameStates: (...args: unknown[]) =>
      mockClearAllPersistedGameStates(...args),
  };
});

describe("useProfileController", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    void i18n.changeLanguage("en");
    mockUseApi.mockReturnValue({
      scoreClient: {
        isNickAvailable: vi.fn().mockResolvedValue(true),
      },
    });
    mockUsePlayer.mockReturnValue({
      player: {
        name: "Player",
        code: "AB12",
        score: 15,
        streak: 2,
        difficulty: "normal",
        keyboardPreference: "onscreen",
        showEndOfGameDialogs: true,
        manualTileSelection: false,
      },
      recoverPlayer: vi.fn().mockResolvedValue(undefined),
      refreshCurrentPlayerProfile: vi.fn().mockResolvedValue(undefined),
      updatePlayer: vi.fn().mockResolvedValue(undefined),
      updatePlayerDifficulty: vi.fn(),
      updatePlayerKeyboardPreference: vi.fn(),
      updatePlayerShowEndOfGameDialogs: vi.fn(),
      updatePlayerManualTileSelection: vi.fn(),
    });
    mockUseAnimationsPreference.mockReturnValue({
      startAnimationsEnabled: true,
      toggleAnimationsDisabled: vi.fn(),
    });
    mockUseThemePreference.mockReturnValue({
      themePreference: "system",
      setThemePreference: vi.fn(),
    });
    mockUseSound.mockReturnValue({
      soundEnabled: true,
      setSoundEnabled: vi.fn(),
    });
    mockReadPersistedGameState.mockReturnValue(null);
    mockClearPersistedGameState.mockReset();
    mockClearAllPersistedGameStates.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("returns an error when the name is not available", async () => {
    const isNickAvailable = vi.fn().mockResolvedValue(false);
    const updatePlayer = vi.fn().mockResolvedValue(undefined);
    mockUseApi.mockReturnValue({
      scoreClient: {
        isNickAvailable,
      },
    });
    mockUsePlayer.mockReturnValue({
      ...mockUsePlayer(),
      updatePlayer,
    });

    const { result } = renderHook(() => useProfileController());

    await expect(result.current.submitProfile("Ana")).resolves.toBe(
      i18n.t("profile.nameNotAvailable"),
    );
    expect(isNickAvailable).toHaveBeenCalledWith("Ana");
    expect(updatePlayer).not.toHaveBeenCalled();
  });

  it("saves the profile and clears the saved message after the timeout", async () => {
    const updatePlayer = vi.fn().mockResolvedValue(undefined);
    mockUsePlayer.mockReturnValue({
      ...mockUsePlayer(),
      updatePlayer,
    });

    const { result } = renderHook(() => useProfileController());

    await act(async () => {
      await expect(result.current.submitProfile(" Ana ")).resolves.toBeNull();
    });

    expect(updatePlayer).toHaveBeenCalledWith("Ana");
    expect(result.current.savedMessage).toBe(i18n.t("profile.savedMessage"));

    act(() => {
      vi.advanceTimersByTime(PROFILE_SAVED_MESSAGE_VISIBILITY_DURATION_MS);
    });

    expect(result.current.savedMessage).toBe("");
  });

  it("requires a recovery code before attempting profile recovery", async () => {
    const { result } = renderHook(() => useProfileController());

    await expect(result.current.submitRecoveryCode("   ")).resolves.toBe(
      i18n.t("profile.recovery.emptyCodeError"),
    );
  });

  it("shows a recovery success message after recovering a profile", async () => {
    const recoverPlayer = vi.fn().mockResolvedValue(undefined);
    mockUsePlayer.mockReturnValue({
      ...mockUsePlayer(),
      recoverPlayer,
    });
    const { result } = renderHook(() => useProfileController());

    await act(async () => {
      await expect(
        result.current.submitRecoveryCode("ab12"),
      ).resolves.toBeNull();
    });

    expect(recoverPlayer).toHaveBeenCalledWith("ab12");
    expect(result.current.savedMessage).toBe(
      i18n.t("profile.recovery.successMessage"),
    );
  });

  it("refreshes the remote profile when the local player has no recovery code", () => {
    const refreshCurrentPlayerProfile = vi.fn().mockResolvedValue(undefined);
    mockUsePlayer.mockReturnValue({
      ...mockUsePlayer(),
      player: {
        name: "Player",
        code: "",
        score: 15,
        streak: 2,
        difficulty: "normal",
        keyboardPreference: "onscreen",
        showEndOfGameDialogs: true,
        manualTileSelection: false,
      },
      refreshCurrentPlayerProfile,
    });

    renderHook(() => useProfileController());

    expect(refreshCurrentPlayerProfile).toHaveBeenCalledTimes(1);
  });

  it("asks for confirmation before changing difficulty with an active game", () => {
    const updatePlayerDifficulty = vi.fn();
    mockReadPersistedGameState.mockReturnValue({
      gameOver: false,
      guesses: ["APPLE"],
      current: "",
    });
    mockUsePlayer.mockReturnValue({
      ...mockUsePlayer(),
      updatePlayerDifficulty,
    });

    const { result } = renderHook(() => useProfileController());

    act(() => {
      result.current.changeDifficulty("hard");
    });

    expect(result.current.isDifficultyChangeConfirmationOpen).toBe(true);
    expect(updatePlayerDifficulty).not.toHaveBeenCalled();

    act(() => {
      result.current.confirmDifficultyChange();
    });

    expect(mockClearAllPersistedGameStates).toHaveBeenCalledTimes(1);
    expect(updatePlayerDifficulty).toHaveBeenCalledWith("hard");
    expect(result.current.isDifficultyChangeConfirmationOpen).toBe(false);
  });

  it("updates the end-of-game dialogs preference", () => {
    const updatePlayerShowEndOfGameDialogs = vi.fn();
    mockUsePlayer.mockReturnValue({
      ...mockUsePlayer(),
      updatePlayerShowEndOfGameDialogs,
    });

    const { result } = renderHook(() => useProfileController());

    act(() => {
      result.current.changeShowEndOfGameDialogs(false);
    });

    expect(updatePlayerShowEndOfGameDialogs).toHaveBeenCalledWith(false);
  });

  it("updates the manual tile selection preference", () => {
    const updatePlayerManualTileSelection = vi.fn();
    mockUsePlayer.mockReturnValue({
      ...mockUsePlayer(),
      updatePlayerManualTileSelection,
    });

    const { result } = renderHook(() => useProfileController());

    act(() => {
      result.current.changeManualTileSelection(true);
    });

    expect(updatePlayerManualTileSelection).toHaveBeenCalledWith(true);
  });

  it("updates the sound preference", () => {
    const setSoundEnabled = vi.fn();
    mockUseSound.mockReturnValue({
      soundEnabled: true,
      setSoundEnabled,
    });

    const { result } = renderHook(() => useProfileController());

    act(() => {
      result.current.changeSoundEnabled(false);
    });

    expect(setSoundEnabled).toHaveBeenCalledWith(false);
  });
});
