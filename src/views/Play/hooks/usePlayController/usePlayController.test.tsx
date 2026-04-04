import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getTotalPointsForWin } from "@domain/wordle";
import { i18n, initI18n } from "@i18n";
import { setWordDictionary } from "@utils/words";
import { PLAY_BOARD_SHARE_CAPTURE_ID } from "@views/Play/constants";
import {
  TILE_STATUS_SOUND_INITIAL_DELAY_MS,
  TILE_STATUS_SOUND_STEP_DELAY_MS,
} from "@providers/Sound/constants";
import * as usePlayControllerUtils from "./utils";
import usePlayController from "./usePlayController";
import {
  COMBO_FLASH_VISIBILITY_DURATION_MS,
  END_OF_GAME_DIALOG_SEEN_SESSION_STORAGE_KEY,
} from "./constants";

const mockUseApi = vi.fn();
const mockUsePlayer = vi.fn();
const mockUseWordle = vi.fn();
const mockUseHintController = vi.fn();
const mockUseHardModeTimer = vi.fn();
const mockUseSound = vi.fn();

vi.mock("@providers", () => ({
  useApi: () => mockUseApi(),
  usePlayer: () => mockUsePlayer(),
}));

vi.mock("@hooks", () => ({
  useWordle: (...args: unknown[]) => mockUseWordle(...args),
}));

vi.mock("../useHintController", () => ({
  useHintController: (...args: unknown[]) => mockUseHintController(...args),
}));

vi.mock("@providers/Sound", () => ({
  useSound: () => mockUseSound(),
}));

vi.mock("./useHardModeTimer", () => ({
  useHardModeTimer: (...args: unknown[]) => mockUseHardModeTimer(...args),
}));

describe("usePlayController", () => {
  let wordleState: Record<string, unknown>;
  let originalNavigatorShare: Navigator["share"] | undefined;
  let originalNavigatorCanShare: Navigator["canShare"] | undefined;

  beforeEach(async () => {
    await initI18n();
    await i18n.changeLanguage("en");
    vi.useFakeTimers();
    mockUseApi.mockClear();
    mockUsePlayer.mockClear();
    mockUseWordle.mockClear();
    mockUseHintController.mockClear();
    mockUseHardModeTimer.mockClear();
    mockUseSound.mockClear();
    window.sessionStorage.clear();
    document.body.innerHTML = "";
    originalNavigatorShare = navigator.share;
    originalNavigatorCanShare = navigator.canShare;
    setWordDictionary(["apple"]);
    wordleState = {
      sessionId: "session-1",
      gameId: "game-1",
      answer: "APPLE",
      won: false,
      guesses: [],
      current: "",
      gameOver: false,
      refresh: vi.fn(),
      forceLoss: vi.fn(),
      showResumeDialog: false,
      boardVersion: 1,
      startNewBoard: vi.fn(),
      revealHint: vi.fn().mockReturnValue(true),
      invalidGuessShakePulse: 0,
    };

    mockUseApi.mockReturnValue({
      scoreClient: {
        recordScore: vi.fn().mockResolvedValue(undefined),
      },
      wordDictionaryClient: {
        refreshRemoteChecksum: vi
          .fn()
          .mockResolvedValue({ checksum: 42, updatedAt: 1 }),
      },
    });
    mockUsePlayer.mockReturnValue({
      player: {
        name: "Player",
        code: "AB12",
        score: 20,
        streak: 2,
        language: "en",
        difficulty: "normal",
        keyboardPreference: "onscreen",
        showEndOfGameDialogs: true,
      },
      replacePlayer: vi.fn(),
      commitVictory: vi.fn().mockResolvedValue(undefined),
      commitLoss: vi.fn().mockResolvedValue(undefined),
    });
    mockUseWordle.mockImplementation(() => wordleState);
    mockUseHintController.mockReturnValue({
      hintsRemaining: 1,
      hintsEnabledForDifficulty: true,
      hintButtonDisabled: false,
      useHint: vi.fn(),
      resetHints: vi.fn(),
    });
    mockUseHardModeTimer.mockReturnValue({
      showHardModeTimer: false,
      showHardModeFinalStretchBar: false,
      hardModeSecondsLeft: 60,
      hardModeTimerStarted: false,
      hardModeTickPulse: 0,
      hardModeClockBoostScale: 0.1,
      hardModeFinalStretchProgressPercent: 100,
      boardShakePulse: 0,
      resetHardModeTimer: vi.fn(),
    });
    mockUseSound.mockReturnValue({
      playSound: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
    window.sessionStorage.clear();
    document.body.innerHTML = "";
    Object.defineProperty(navigator, "share", {
      value: originalNavigatorShare,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(navigator, "canShare", {
      value: originalNavigatorCanShare,
      configurable: true,
      writable: true,
    });
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("awards points and streak exactly once when a round changes to won", () => {
    const commitVictory = vi.fn().mockResolvedValue(undefined);
    mockUsePlayer.mockReturnValue({
      ...mockUsePlayer(),
      player: {
        name: "Player",
        code: "AB12",
        score: 20,
        streak: 2,
        language: "en",
        difficulty: "normal",
        keyboardPreference: "onscreen",
        showEndOfGameDialogs: true,
      },
      commitVictory,
    });

    const { rerender } = renderHook(() => usePlayController());

    wordleState = {
      ...wordleState,
      guesses: ["SLATE", "CRANE", "APPLE"],
      won: true,
      gameOver: true,
    };

    rerender();
    rerender();

    expect(commitVictory).toHaveBeenCalledTimes(1);
    expect(commitVictory).toHaveBeenCalledWith(getTotalPointsForWin(3, 2, 2));
  });

  it("allows unknown words in normal difficulty", () => {
    renderHook(() => usePlayController());

    expect(mockUseWordle).toHaveBeenCalledWith(
      expect.objectContaining({
        allowUnknownWords: true,
        language: "en",
      }),
    );
  });

  it("exposes normal dictionary bonus row flags for wrong dictionary rows", () => {
    setWordDictionary(["apple", "crane", "slate"]);
    wordleState = {
      ...wordleState,
      answer: "APPLE",
      guesses: [
        {
          word: "CRANE",
          statuses: ["absent", "absent", "absent", "absent", "absent"],
        },
        {
          word: "ZZZZZ",
          statuses: ["absent", "absent", "absent", "absent", "absent"],
        },
        {
          word: "APPLE",
          statuses: ["correct", "correct", "correct", "correct", "correct"],
        },
      ],
    };

    const { result } = renderHook(() => usePlayController());

    expect(result.current.normalDictionaryBonusRowFlags).toEqual([
      true,
      false,
      false,
    ]);
  });

  it("awards dictionary-row bonus only on wins in normal difficulty", () => {
    const commitVictory = vi.fn().mockResolvedValue(undefined);
    mockUsePlayer.mockReturnValue({
      ...mockUsePlayer(),
      player: {
        name: "Player",
        code: "AB12",
        score: 20,
        streak: 2,
        language: "en",
        difficulty: "normal",
        keyboardPreference: "onscreen",
        showEndOfGameDialogs: true,
      },
      commitVictory,
    });
    setWordDictionary(["apple", "slate", "crane", "brick"]);

    const { rerender } = renderHook(() => usePlayController());

    wordleState = {
      ...wordleState,
      answer: "APPLE",
      guesses: ["SLATE", "CRANE", "BRICK", "APPLE"],
      won: true,
      gameOver: true,
    };

    rerender();

    expect(commitVictory).toHaveBeenCalledWith(getTotalPointsForWin(4, 3.2, 2));
  });

  it("adds dictionary-row bonus into the difficulty multiplier on normal wins", () => {
    setWordDictionary(["apple", "slate", "crane", "brick"]);

    const { rerender, result } = renderHook(() => usePlayController());

    wordleState = {
      ...wordleState,
      answer: "APPLE",
      guesses: ["SLATE", "CRANE", "BRICK", "APPLE"],
      won: true,
      gameOver: true,
    };

    rerender();

    expect(result.current.victoryScoreSummary?.items).toEqual(
      expect.arrayContaining([{ key: "difficulty", value: 3.2 }]),
    );
    expect(result.current.victoryScoreSummary?.items).toEqual(
      expect.arrayContaining([{ key: "dictionary", value: 1.2 }]),
    );
  });

  it("rejects unknown words in hard difficulty", () => {
    mockUsePlayer.mockReturnValue({
      ...mockUsePlayer(),
      player: {
        name: "Player",
        code: "AB12",
        score: 20,
        streak: 2,
        language: "en",
        difficulty: "hard",
        keyboardPreference: "onscreen",
        showEndOfGameDialogs: true,
      },
      replacePlayer: vi.fn(),
      commitVictory: vi.fn().mockResolvedValue(undefined),
      commitLoss: vi.fn().mockResolvedValue(undefined),
    });

    renderHook(() => usePlayController());

    expect(mockUseWordle).toHaveBeenCalledWith(
      expect.objectContaining({
        allowUnknownWords: false,
        language: "en",
      }),
    );
  });

  it("adds insane time bonus to the committed victory score", () => {
    const commitVictory = vi.fn().mockResolvedValue(undefined);
    mockUsePlayer.mockReturnValue({
      ...mockUsePlayer(),
      player: {
        name: "Player",
        code: "AB12",
        score: 20,
        streak: 2,
        language: "en",
        difficulty: "insane",
        keyboardPreference: "onscreen",
        showEndOfGameDialogs: true,
      },
      commitVictory,
    });
    mockUseHardModeTimer.mockReturnValue({
      ...mockUseHardModeTimer(),
      hardModeSecondsLeft: 11,
    });

    const { rerender, result } = renderHook(() => usePlayController());

    wordleState = {
      ...wordleState,
      guesses: ["SLATE", "CRANE", "APPLE"],
      won: true,
      gameOver: true,
    };

    rerender();

    expect(commitVictory).toHaveBeenCalledWith(
      getTotalPointsForWin(3, 9, 2, 5),
    );
    expect(result.current.victoryScoreSummary?.total).toBe(
      getTotalPointsForWin(3, 9, 2, 5),
    );
    expect(result.current.showVictoryDialog).toBe(true);
  });

  it("plays line and tile-status sounds when a new guess is added", () => {
    const playSound = vi.fn();
    mockUseSound.mockReturnValue({
      playSound,
    });

    const { rerender } = renderHook(() => usePlayController());
    playSound.mockClear();

    wordleState = {
      ...wordleState,
      guesses: [
        {
          word: "CRANE",
          statuses: ["correct", "present", "absent", "absent", "absent"],
        },
      ],
      gameOver: false,
      won: false,
    };

    rerender();

    expect(playSound).toHaveBeenCalledWith("line_change");
    expect(playSound).toHaveBeenCalledWith("tile_correct", {
      delayMs: TILE_STATUS_SOUND_INITIAL_DELAY_MS,
    });
    expect(playSound).toHaveBeenCalledWith("tile_present", {
      delayMs:
        TILE_STATUS_SOUND_INITIAL_DELAY_MS + TILE_STATUS_SOUND_STEP_DELAY_MS,
    });
    expect(playSound).toHaveBeenCalledWith("tile_absent", {
      delayMs:
        TILE_STATUS_SOUND_INITIAL_DELAY_MS +
        2 * TILE_STATUS_SOUND_STEP_DELAY_MS,
    });
  });

  it("plays round-start sound on mount and when a new board version is loaded", () => {
    const playSound = vi.fn();
    mockUseSound.mockReturnValue({
      playSound,
    });

    const { rerender } = renderHook(() => usePlayController());

    expect(playSound).toHaveBeenCalledWith("round_start");

    wordleState = {
      ...wordleState,
      boardVersion: 2,
    };
    rerender();

    expect(playSound).toHaveBeenCalledWith("round_start");
    expect(
      playSound.mock.calls.filter(([event]) => event === "round_start").length,
    ).toBe(2);
  });

  it("does not play round-start sound while resume dialog is visible", () => {
    const playSound = vi.fn();
    mockUseSound.mockReturnValue({
      playSound,
    });
    wordleState = {
      ...wordleState,
      showResumeDialog: true,
    };

    renderHook(() => usePlayController());

    expect(playSound).not.toHaveBeenCalledWith("round_start");
  });

  it("plays win and loss sounds only when the game transitions to game over", () => {
    const playSound = vi.fn();
    mockUseSound.mockReturnValue({
      playSound,
    });

    const { rerender } = renderHook(() => usePlayController());

    wordleState = {
      ...wordleState,
      won: true,
      gameOver: true,
    };
    rerender();
    rerender();

    expect(playSound).toHaveBeenCalledWith("round_win");
    expect(
      playSound.mock.calls.filter(([event]) => event === "round_win").length,
    ).toBe(1);

    wordleState = {
      ...wordleState,
      won: false,
      gameOver: false,
    };
    rerender();

    wordleState = {
      ...wordleState,
      won: false,
      gameOver: true,
    };
    rerender();

    expect(playSound).toHaveBeenCalledWith("round_loss");
    expect(
      playSound.mock.calls.filter(([event]) => event === "round_loss").length,
    ).toBe(1);
  });

  it("plays hint sound when a hint is consumed", () => {
    const playSound = vi.fn();
    const useHint = vi.fn().mockReturnValue(true);
    mockUseSound.mockReturnValue({
      playSound,
    });
    mockUseHintController.mockReturnValue({
      hintsRemaining: 1,
      hintsEnabledForDifficulty: true,
      hintButtonDisabled: false,
      useHint,
      resetHints: vi.fn(),
    });

    const { result } = renderHook(() => usePlayController());

    act(() => {
      result.current.useHint();
    });

    expect(useHint).toHaveBeenCalledTimes(1);
    expect(playSound).toHaveBeenCalledWith("hint_use");
  });

  it("does not play hint sound when hint usage is rejected", () => {
    const playSound = vi.fn();
    const useHint = vi.fn().mockReturnValue(false);
    mockUseSound.mockReturnValue({
      playSound,
    });
    mockUseHintController.mockReturnValue({
      hintsRemaining: 1,
      hintsEnabledForDifficulty: true,
      hintButtonDisabled: false,
      useHint,
      resetHints: vi.fn(),
    });

    const { result } = renderHook(() => usePlayController());

    act(() => {
      result.current.useHint();
    });

    expect(useHint).toHaveBeenCalledTimes(1);
    expect(playSound).not.toHaveBeenCalledWith("hint_use");
  });

  it("combines hard mode shake pulse with invalid submit shake pulse", () => {
    mockUseHardModeTimer.mockReturnValue({
      ...mockUseHardModeTimer(),
      boardShakePulse: 2,
    });
    wordleState = {
      ...wordleState,
      invalidGuessShakePulse: 3,
    };

    const { result } = renderHook(() => usePlayController());

    expect(result.current.boardShakePulse).toBe(5);
  });

  it("restores legacy feedback and allows reopening the dismissed end-of-game dialog", () => {
    const { rerender, result } = renderHook(() => usePlayController());

    wordleState = {
      ...wordleState,
      guesses: ["SLATE", "CRANE", "APPLE"],
      won: true,
      gameOver: true,
    };

    rerender();

    expect(result.current.showVictoryDialog).toBe(true);
    expect(result.current.showLegacyEndOfGameMessage).toBe(false);
    expect(result.current.canReopenEndOfGameDialog).toBe(false);
    expect(result.current.showRefreshAttention).toBe(true);

    act(() => {
      result.current.closeEndOfGameDialog();
    });

    expect(result.current.showVictoryDialog).toBe(false);
    expect(result.current.showLegacyEndOfGameMessage).toBe(true);
    expect(result.current.canReopenEndOfGameDialog).toBe(true);
    expect(result.current.showRefreshAttention).toBe(true);

    act(() => {
      result.current.reopenEndOfGameDialog();
    });

    expect(result.current.showVictoryDialog).toBe(true);
    expect(result.current.showLegacyEndOfGameMessage).toBe(false);
    expect(result.current.canReopenEndOfGameDialog).toBe(false);
  });

  it("reopens the defeat dialog after it is dismissed", () => {
    const { rerender, result } = renderHook(() => usePlayController());

    wordleState = {
      ...wordleState,
      answer: "BRICK",
      guesses: ["SLATE", "CRANE", "MANGO", "TRUCK", "LEMON", "CANDY"],
      won: false,
      gameOver: true,
    };

    rerender();

    expect(result.current.showDefeatDialog).toBe(true);

    act(() => {
      result.current.closeEndOfGameDialog();
    });

    expect(result.current.showDefeatDialog).toBe(false);
    expect(result.current.canReopenEndOfGameDialog).toBe(true);

    act(() => {
      result.current.reopenEndOfGameDialog();
    });

    expect(result.current.showDefeatDialog).toBe(true);
    expect(result.current.canReopenEndOfGameDialog).toBe(false);
  });

  it("shows the end-of-game settings hint only once per tab session", () => {
    const { rerender, result } = renderHook(() => usePlayController());

    wordleState = {
      ...wordleState,
      guesses: ["SLATE", "CRANE", "APPLE"],
      won: true,
      gameOver: true,
    };

    rerender();

    expect(result.current.showEndOfGameSettingsHint).toBe(true);
    expect(
      window.sessionStorage.getItem(
        END_OF_GAME_DIALOG_SEEN_SESSION_STORAGE_KEY,
      ),
    ).toBe("seen");

    wordleState = {
      ...wordleState,
      current: "",
      gameOver: false,
      guesses: [],
    };
    rerender();

    wordleState = {
      ...wordleState,
      answer: "BRICK",
      won: false,
      gameOver: true,
      guesses: ["SLATE", "CRANE", "BRICK"],
    };
    rerender();

    expect(result.current.showDefeatDialog).toBe(true);
    expect(result.current.showEndOfGameSettingsHint).toBe(false);
  });

  it("activates refresh attention immediately when end-of-game dialogs are disabled", () => {
    mockUsePlayer.mockReturnValue({
      ...mockUsePlayer(),
      player: {
        name: "Player",
        code: "AB12",
        score: 20,
        streak: 2,
        language: "en",
        difficulty: "normal",
        keyboardPreference: "onscreen",
        showEndOfGameDialogs: false,
      },
    });

    const { rerender, result } = renderHook(() => usePlayController());

    wordleState = {
      ...wordleState,
      guesses: ["SLATE", "CRANE", "APPLE"],
      won: true,
      gameOver: true,
    };

    rerender();

    expect(result.current.showLegacyEndOfGameMessage).toBe(true);
    expect(result.current.showRefreshAttention).toBe(true);
    expect(result.current.refreshAttentionPulse).toBeGreaterThan(0);
  });

  it("shows a combo flash when a new guess has yellow or green tiles", () => {
    const { result, rerender } = renderHook(() => usePlayController());

    expect(result.current.comboFlash).toBeNull();

    wordleState = {
      ...wordleState,
      guesses: [
        {
          word: "CRANE",
          statuses: ["correct", "present", "absent", "absent", "absent"],
        },
      ],
    };

    rerender();

    expect(result.current.comboFlash).toEqual({
      count: 2,
      tone: "correct",
      pulse: 1,
    });

    act(() => {
      vi.advanceTimersByTime(COMBO_FLASH_VISIBILITY_DURATION_MS);
    });

    expect(result.current.comboFlash).toBeNull();
  });

  it("does not show a combo flash when a new guess has only gray tiles", () => {
    const { result, rerender } = renderHook(() => usePlayController());

    wordleState = {
      ...wordleState,
      guesses: [
        {
          word: "CRANE",
          statuses: ["absent", "absent", "absent", "absent", "absent"],
        },
      ],
    };

    rerender();

    expect(result.current.comboFlash).toBeNull();
  });

  it("opens a confirmation dialog before refreshing an active game", () => {
    const resetHints = vi.fn();
    const resetHardModeTimer = vi.fn();
    const refresh = vi.fn();
    wordleState = {
      ...wordleState,
      current: "AP",
      refresh,
    };
    mockUseHintController.mockReturnValue({
      ...mockUseHintController(),
      hintsRemaining: 1,
      hintsEnabledForDifficulty: true,
      hintButtonDisabled: false,
      useHint: vi.fn(),
      resetHints,
    });
    mockUseHardModeTimer.mockReturnValue({
      ...mockUseHardModeTimer(),
      resetHardModeTimer,
    });

    const { result } = renderHook(() => usePlayController());

    act(() => {
      result.current.refreshBoard();
    });

    expect(result.current.showRefreshDialog).toBe(true);
    expect(refresh).not.toHaveBeenCalled();

    act(() => {
      result.current.confirmRefreshBoard();
    });

    expect(result.current.showRefreshDialog).toBe(false);
    expect(resetHints).toHaveBeenCalledTimes(1);
    expect(resetHardModeTimer).toHaveBeenCalledTimes(1);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("keeps the word list dialog disabled outside easy mode", () => {
    const { result, rerender } = renderHook(() => usePlayController());

    act(() => {
      result.current.openWordsDialog();
    });

    expect(result.current.showWordsDialog).toBe(false);

    mockUsePlayer.mockReturnValue({
      ...mockUsePlayer(),
      player: {
        name: "Player",
        code: "AB12",
        score: 20,
        streak: 2,
        language: "en",
        difficulty: "easy",
        keyboardPreference: "onscreen",
        showEndOfGameDialogs: true,
      },
    });

    rerender();

    act(() => {
      result.current.openWordsDialog();
    });

    expect(result.current.showWordsDialog).toBe(true);
  });

  it("refreshes the remote dictionary checksum and exposes a success message", async () => {
    const refreshRemoteChecksum = vi
      .fn()
      .mockResolvedValue({ checksum: 42, updatedAt: 1 });
    mockUseApi.mockReturnValue({
      scoreClient: {
        recordScore: vi.fn().mockResolvedValue(undefined),
      },
      wordDictionaryClient: {
        refreshRemoteChecksum,
      },
    });

    const { result } = renderHook(() => usePlayController());

    await act(async () => {
      await result.current.refreshRemoteDictionaryChecksum();
    });

    expect(refreshRemoteChecksum).toHaveBeenCalledTimes(1);
    expect(result.current.dictionaryChecksumMessage).toBe(
      i18n.t("play.developerConsole.checksumUpdated", {
        checksum: 42,
      }),
    );
    expect(result.current.dictionaryChecksumMessageKind).toBe("success");
  });

  it("shares the victory board screenshot through the system share api", async () => {
    const boardElement = document.createElement("div");
    boardElement.id = PLAY_BOARD_SHARE_CAPTURE_ID;
    document.body.append(boardElement);

    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", {
      value: share,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(navigator, "canShare", {
      value: vi.fn().mockReturnValue(true),
      configurable: true,
      writable: true,
    });

    vi.spyOn(
      usePlayControllerUtils,
      "captureVictoryBoardImageFile",
    ).mockResolvedValue(new File([new Blob(["board"])], "wordle-board.png"));

    const { result, rerender } = renderHook(() => usePlayController());

    wordleState = {
      ...wordleState,
      guesses: ["SLATE", "CRANE", "APPLE"],
      won: true,
      gameOver: true,
    };
    rerender();

    await act(async () => {
      await result.current.shareVictoryBoard();
    });

    expect(share).toHaveBeenCalledTimes(1);
    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({
        files: expect.any(Array),
        title: i18n.t("play.victoryDialog.sharePayloadTitle"),
        text: i18n.t("play.victoryDialog.sharePayloadText", { count: 3 }),
      }),
    );
    expect(result.current.victoryBoardShareError).toBeNull();
  });

  it("sets a share error when the board element is not available", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", {
      value: share,
      configurable: true,
      writable: true,
    });

    const { result, rerender } = renderHook(() => usePlayController());

    wordleState = {
      ...wordleState,
      guesses: ["SLATE", "CRANE", "APPLE"],
      won: true,
      gameOver: true,
    };
    rerender();

    await act(async () => {
      await result.current.shareVictoryBoard();
    });

    expect(share).not.toHaveBeenCalled();
    expect(result.current.victoryBoardShareError).toBe(
      i18n.t("play.victoryDialog.shareErrors.captureUnavailable"),
    );
  });
});
