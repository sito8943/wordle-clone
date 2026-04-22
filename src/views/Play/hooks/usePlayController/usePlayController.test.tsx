import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CLASSIC_ROUND_CONFIG,
  getTotalPointsForWin,
  WORDLE_MODE_IDS,
} from "@domain/wordle";
import { WORDS_DEFAULT_LANGUAGE } from "@api/words";
import { env } from "@config";
import { getHelpRoute } from "@config/routes";
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
  TUTORIAL_PROMPT_SEEN_MODES_STORAGE_KEY,
} from "./constants";

const mockUseApi = vi.fn();
const mockUsePlayer = vi.fn();
const mockUseWordle = vi.fn();
const mockUseHintController = vi.fn();
const mockUseHardModeTimer = vi.fn();
const mockUseSound = vi.fn();
const mockNavigate = vi.fn();
const defaultTimerAutoPauseEnabled = env.timerAutoPauseEnabled;

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

vi.mock("react-router", () => ({
  useNavigate: () => mockNavigate,
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
    mockNavigate.mockClear();
    window.sessionStorage.clear();
    window.localStorage.clear();
    document.body.innerHTML = "";
    originalNavigatorShare = navigator.share;
    originalNavigatorCanShare = navigator.canShare;
    setWordDictionary(["apple"]);
    wordleState = {
      sessionId: "session-1",
      gameId: "game-1",
      roundStartedAt: 1_000,
      answer: "APPLE",
      won: false,
      guesses: [],
      current: "",
      gameOver: false,
      refresh: vi.fn(),
      forceLoss: vi.fn(),
      showResumeDialog: false,
      showDictionaryChecksumDialog: false,
      acknowledgeDictionaryChecksumChange: vi.fn(),
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
      challengeClient: {
        isConfigured: false,
        listAllChallenges: vi.fn().mockResolvedValue([]),
        getTodayChallenges: vi.fn(),
        generateDailyChallenges: vi.fn(),
        regenerateDailyChallenges: vi.fn(),
        getPlayerChallengeProgress: vi.fn(),
        completeChallenge: vi.fn(),
        resetPlayerChallengeProgressForDate: vi
          .fn()
          .mockResolvedValue({ resetCount: 0, pointsReverted: 0 }),
        seedChallenges: vi
          .fn()
          .mockResolvedValue({ inserted: 0, total: 0, alreadySeeded: true }),
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
        manualTileSelection: false,
      },
      replacePlayer: vi.fn(),
      updatePlayerDifficulty: vi.fn(),
      updatePlayerManualTileSelection: vi.fn(),
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
    window.localStorage.clear();
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
    env.timerAutoPauseEnabled = defaultTimerAutoPauseEnabled;
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
    expect(commitVictory).toHaveBeenCalledWith(
      getTotalPointsForWin(3, 2, 2),
      undefined,
      1_000,
      WORDLE_MODE_IDS.CLASSIC,
    );
  });

  it("evaluates and completes eligible daily challenges when round ends", async () => {
    const date = new Date().toISOString().slice(0, 10);
    const completeChallenge = vi
      .fn()
      .mockResolvedValueOnce({ pointsAwarded: 5, alreadyCompleted: false })
      .mockResolvedValueOnce({ pointsAwarded: 15, alreadyCompleted: false });

    mockUseApi.mockReturnValue({
      scoreClient: {
        recordScore: vi.fn().mockResolvedValue(undefined),
      },
      wordDictionaryClient: {
        refreshRemoteChecksum: vi
          .fn()
          .mockResolvedValue({ checksum: 42, updatedAt: 1 }),
      },
      challengeClient: {
        isConfigured: true,
        listAllChallenges: vi.fn().mockResolvedValue([]),
        getTodayChallenges: vi.fn().mockResolvedValue({
          date,
          simple: {
            id: "simple-1",
            name: "Steady Player",
            description: "",
            type: "simple",
            conditionKey: "steady_player",
          },
          complex: {
            id: "complex-1",
            name: "Speedster",
            description: "",
            type: "complex",
            conditionKey: "speedster",
          },
        }),
        generateDailyChallenges: vi.fn(),
        regenerateDailyChallenges: vi.fn(),
        getPlayerChallengeProgress: vi.fn().mockResolvedValue([]),
        completeChallenge,
        resetPlayerChallengeProgressForDate: vi
          .fn()
          .mockResolvedValue({ resetCount: 0, pointsReverted: 0 }),
        seedChallenges: vi
          .fn()
          .mockResolvedValue({ inserted: 0, total: 0, alreadySeeded: true }),
      },
    });

    const { rerender, result } = renderHook(() => usePlayController());

    wordleState = {
      ...wordleState,
      answer: "APPLE",
      guesses: [
        {
          word: "APPLE",
          statuses: ["correct", "correct", "correct", "correct", "correct"],
        },
      ],
      won: true,
      gameOver: true,
      roundStartedAt: Date.now() - 5_000,
    };

    await act(async () => {
      rerender();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(completeChallenge).toHaveBeenCalledTimes(2);
    expect(completeChallenge).toHaveBeenNthCalledWith(1, "simple-1", date);
    expect(completeChallenge).toHaveBeenNthCalledWith(2, "complex-1", date);
    expect(result.current.challengeCompletionMessage).toBe(
      "2 challenges completed (+20 pts)",
    );
    expect(result.current.endOfGameChallengeBonusPoints).toBe(20);
  });

  it("does not complete persistent challenge on the first daily win", async () => {
    const date = new Date().toISOString().slice(0, 10);
    const completeChallenge = vi.fn();

    mockUsePlayer.mockReturnValue({
      ...mockUsePlayer(),
      player: {
        name: "Player",
        code: "AB12",
        score: 20,
        streak: 70,
        language: "en",
        difficulty: "normal",
        keyboardPreference: "onscreen",
        showEndOfGameDialogs: true,
      },
    });

    mockUseApi.mockReturnValue({
      scoreClient: {
        recordScore: vi.fn().mockResolvedValue(undefined),
      },
      wordDictionaryClient: {
        refreshRemoteChecksum: vi
          .fn()
          .mockResolvedValue({ checksum: 42, updatedAt: 1 }),
      },
      challengeClient: {
        isConfigured: true,
        listAllChallenges: vi.fn().mockResolvedValue([]),
        getTodayChallenges: vi.fn().mockResolvedValue({
          date,
          simple: {
            id: "simple-1",
            name: "Persistent",
            description: "",
            type: "simple",
            conditionKey: "persistent",
          },
          complex: {
            id: "complex-1",
            name: "Persistent+",
            description: "",
            type: "complex",
            conditionKey: "persistent",
          },
        }),
        generateDailyChallenges: vi.fn(),
        regenerateDailyChallenges: vi.fn(),
        getPlayerChallengeProgress: vi.fn().mockResolvedValue([]),
        completeChallenge,
        resetPlayerChallengeProgressForDate: vi
          .fn()
          .mockResolvedValue({ resetCount: 0, pointsReverted: 0 }),
        seedChallenges: vi
          .fn()
          .mockResolvedValue({ inserted: 0, total: 0, alreadySeeded: true }),
      },
    });

    const { rerender } = renderHook(() => usePlayController());

    wordleState = {
      ...wordleState,
      guesses: [
        {
          word: "APPLE",
          statuses: ["correct", "correct", "correct", "correct", "correct"],
        },
      ],
      won: true,
      gameOver: true,
      roundStartedAt: Date.now() - 5_000,
    };

    await act(async () => {
      rerender();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(completeChallenge).not.toHaveBeenCalled();
  });

  it("allows unknown words in normal difficulty", () => {
    renderHook(() => usePlayController());

    expect(mockUseWordle).toHaveBeenCalledWith(
      expect.objectContaining({
        allowUnknownWords: true,
        language: WORDS_DEFAULT_LANGUAGE,
        roundConfig: CLASSIC_ROUND_CONFIG,
      }),
    );
  });

  it("resolves and exposes modeId from controller options", () => {
    const { result } = renderHook(() =>
      usePlayController({ modeId: WORDLE_MODE_IDS.ZEN }),
    );

    expect(result.current.modeId).toBe(WORDLE_MODE_IDS.ZEN);
    expect(result.current.modeEnabled).toBe(false);
    expect(result.current.activeModeId).toBe(WORDLE_MODE_IDS.CLASSIC);
    expect(mockUseWordle).toHaveBeenCalledWith(
      expect.objectContaining({
        roundConfig: CLASSIC_ROUND_CONFIG,
      }),
    );
  });

  it("keeps lightning as enabled mode and active gameplay mode", () => {
    const { result } = renderHook(() =>
      usePlayController({ modeId: WORDLE_MODE_IDS.LIGHTNING }),
    );

    expect(result.current.modeId).toBe(WORDLE_MODE_IDS.LIGHTNING);
    expect(result.current.modeEnabled).toBe(true);
    expect(result.current.activeModeId).toBe(WORDLE_MODE_IDS.LIGHTNING);
  });

  it("falls back to classic mode when an unknown mode is provided", () => {
    const { result } = renderHook(() =>
      usePlayController({
        modeId: "unsupported-mode" as never,
      }),
    );

    expect(result.current.modeId).toBe(WORDLE_MODE_IDS.CLASSIC);
    expect(result.current.modeEnabled).toBe(true);
    expect(result.current.activeModeId).toBe(WORDLE_MODE_IDS.CLASSIC);
  });

  it("keeps classic as enabled mode and active gameplay mode", () => {
    const { result } = renderHook(() =>
      usePlayController({ modeId: WORDLE_MODE_IDS.CLASSIC }),
    );

    expect(result.current.modeId).toBe(WORDLE_MODE_IDS.CLASSIC);
    expect(result.current.modeEnabled).toBe(true);
    expect(result.current.activeModeId).toBe(WORDLE_MODE_IDS.CLASSIC);
  });

  it("opens and closes the quick settings panel", () => {
    const { result } = renderHook(() => usePlayController());

    expect(result.current.showSettingsPanel).toBe(false);

    act(() => {
      result.current.openSettingsPanel();
    });

    expect(result.current.showSettingsPanel).toBe(true);

    act(() => {
      result.current.closeSettingsPanel();
    });

    expect(result.current.showSettingsPanel).toBe(false);
  });

  it("shows the tutorial prompt when the selected mode has not been seen", () => {
    const { result } = renderHook(() => usePlayController());

    expect(result.current.showTutorialPromptDialog).toBe(true);
  });

  it("does not show the tutorial prompt when the selected mode was already seen", () => {
    window.localStorage.setItem(
      TUTORIAL_PROMPT_SEEN_MODES_STORAGE_KEY,
      JSON.stringify({ classic: true }),
    );

    const { result } = renderHook(() => usePlayController());

    expect(result.current.showTutorialPromptDialog).toBe(false);
  });

  it("shows lightning tutorial when only classic was seen before", () => {
    window.localStorage.setItem(
      TUTORIAL_PROMPT_SEEN_MODES_STORAGE_KEY,
      JSON.stringify({ classic: true }),
    );

    const { result } = renderHook(() =>
      usePlayController({ modeId: WORDLE_MODE_IDS.LIGHTNING }),
    );

    expect(result.current.showTutorialPromptDialog).toBe(true);
  });

  it("keeps legacy tutorial flag behavior for classic only", () => {
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
        declinedTutorial: true,
        showEndOfGameDialogs: true,
        manualTileSelection: false,
      },
    });

    const { result: classicResult } = renderHook(() => usePlayController());
    const { result: lightningResult } = renderHook(() =>
      usePlayController({ modeId: WORDLE_MODE_IDS.LIGHTNING }),
    );

    expect(classicResult.current.showTutorialPromptDialog).toBe(false);
    expect(lightningResult.current.showTutorialPromptDialog).toBe(true);
  });

  it("hides and persists tutorial rejection when the player declines it", () => {
    const replacePlayer = vi.fn();
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
        manualTileSelection: false,
      },
      replacePlayer,
    });

    const { result } = renderHook(() => usePlayController());

    act(() => {
      result.current.declineTutorialPrompt();
    });

    expect(result.current.showTutorialPromptDialog).toBe(false);
    expect(
      JSON.parse(
        window.localStorage.getItem(TUTORIAL_PROMPT_SEEN_MODES_STORAGE_KEY) ??
          "{}",
      ),
    ).toMatchObject({ classic: true });
    expect(replacePlayer).toHaveBeenCalledWith({ declinedTutorial: true });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("navigates to help when the player accepts the tutorial prompt", () => {
    const replacePlayer = vi.fn();
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
        manualTileSelection: false,
      },
      replacePlayer,
    });

    const { result } = renderHook(() => usePlayController());

    act(() => {
      result.current.acceptTutorialPrompt();
    });

    expect(result.current.showTutorialPromptDialog).toBe(false);
    expect(
      JSON.parse(
        window.localStorage.getItem(TUTORIAL_PROMPT_SEEN_MODES_STORAGE_KEY) ??
          "{}",
      ),
    ).toMatchObject({ classic: true });
    expect(mockNavigate).toHaveBeenCalledWith(getHelpRoute("classic"));
    expect(replacePlayer).toHaveBeenCalledWith({ declinedTutorial: false });
  });

  it("navigates to mode-specific help for lightning tutorial acceptance", () => {
    const replacePlayer = vi.fn();
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
        manualTileSelection: false,
      },
      replacePlayer,
    });

    const { result } = renderHook(() =>
      usePlayController({ modeId: WORDLE_MODE_IDS.LIGHTNING }),
    );

    act(() => {
      result.current.acceptTutorialPrompt();
    });

    expect(result.current.showTutorialPromptDialog).toBe(false);
    expect(
      JSON.parse(
        window.localStorage.getItem(TUTORIAL_PROMPT_SEEN_MODES_STORAGE_KEY) ??
          "{}",
      ),
    ).toMatchObject({ lightning: true });
    expect(mockNavigate).toHaveBeenCalledWith(getHelpRoute("lightning"));
    expect(replacePlayer).toHaveBeenCalledWith({ declinedTutorial: false });
  });

  it("updates the manual tile selection preference from quick settings", () => {
    const updatePlayerManualTileSelection = vi.fn();
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
        manualTileSelection: false,
      },
      updatePlayerManualTileSelection,
    });

    const { result } = renderHook(() => usePlayController());

    act(() => {
      result.current.changeManualTileSelection(true);
      result.current.changeManualTileSelection(true);
    });

    expect(updatePlayerManualTileSelection).toHaveBeenCalledTimes(1);
    expect(updatePlayerManualTileSelection).toHaveBeenCalledWith(true);
  });

  it("asks for confirmation before changing difficulty during an active game", () => {
    const updatePlayerDifficulty = vi.fn();
    const startNewBoard = vi.fn();
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
        manualTileSelection: false,
      },
      updatePlayerDifficulty,
    });

    wordleState = {
      ...wordleState,
      current: "AP",
      startNewBoard,
    };
    window.localStorage.setItem(env.wordleGameStorageKey, "persisted-game");

    const { result } = renderHook(() => usePlayController());

    act(() => {
      result.current.changeDifficulty("hard");
    });

    expect(result.current.isDifficultyChangeConfirmationOpen).toBe(true);
    expect(updatePlayerDifficulty).not.toHaveBeenCalled();

    act(() => {
      result.current.confirmDifficultyChange();
    });

    expect(updatePlayerDifficulty).toHaveBeenCalledTimes(1);
    expect(updatePlayerDifficulty).toHaveBeenCalledWith("hard");
    expect(startNewBoard).toHaveBeenCalledTimes(1);
    expect(result.current.isDifficultyChangeConfirmationOpen).toBe(false);
    expect(window.localStorage.getItem(env.wordleGameStorageKey)).toBeNull();
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

    expect(commitVictory).toHaveBeenCalledWith(
      getTotalPointsForWin(4, 3.2, 2),
      undefined,
      1_000,
      WORDLE_MODE_IDS.CLASSIC,
    );
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
        language: WORDS_DEFAULT_LANGUAGE,
        roundConfig: CLASSIC_ROUND_CONFIG,
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
      getTotalPointsForWin(3, 7, 2, 2),
      undefined,
      1_000,
      WORDLE_MODE_IDS.CLASSIC,
    );
    expect(result.current.victoryScoreSummary?.total).toBe(
      getTotalPointsForWin(3, 7, 2, 2),
    );
    expect(result.current.showVictoryDialog).toBe(true);
  });

  it("adds timed-mode bonus to lightning wins using current difficulty multiplier", () => {
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
    mockUseHardModeTimer.mockReturnValue({
      ...mockUseHardModeTimer(),
      hardModeSecondsLeft: 11,
    });

    const { rerender, result } = renderHook(() =>
      usePlayController({ modeId: WORDLE_MODE_IDS.LIGHTNING }),
    );

    wordleState = {
      ...wordleState,
      guesses: ["SLATE", "CRANE", "APPLE"],
      won: true,
      gameOver: true,
    };

    rerender();

    expect(commitVictory).toHaveBeenCalledWith(
      getTotalPointsForWin(3, 2, 2, 2),
      undefined,
      1_000,
      WORDLE_MODE_IDS.LIGHTNING,
    );
    expect(result.current.victoryScoreSummary?.items).toEqual(
      expect.arrayContaining([{ key: "time", value: 2 }]),
    );
  });

  it("activates hard-mode timer in lightning mode regardless of player difficulty", () => {
    renderHook(() => usePlayController({ modeId: WORDLE_MODE_IDS.LIGHTNING }));

    expect(mockUseHardModeTimer).toHaveBeenCalledWith(
      expect.objectContaining({
        hardModeEnabled: true,
      }),
    );
  });

  it("pauses hard-mode timer while play dialogs are open", () => {
    env.timerAutoPauseEnabled = true;
    wordleState = {
      ...wordleState,
      showDictionaryChecksumDialog: true,
    };

    renderHook(() => usePlayController());

    expect(mockUseHardModeTimer).toHaveBeenCalledWith(
      expect.objectContaining({
        pauseTimer: true,
      }),
    );
  });

  it("keeps hard-mode timer running while dialogs are open when auto pause flag is disabled", () => {
    env.timerAutoPauseEnabled = false;
    wordleState = {
      ...wordleState,
      showDictionaryChecksumDialog: true,
    };

    renderHook(() => usePlayController());

    expect(mockUseHardModeTimer).toHaveBeenCalledWith(
      expect.objectContaining({
        pauseTimer: false,
        pauseWhenHidden: false,
      }),
    );
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

  it("shows a checksum dialog and restarts the board after accepting it", () => {
    const resetHints = vi.fn();
    const resetHardModeTimer = vi.fn();
    const refresh = vi.fn();
    const acknowledgeDictionaryChecksumChange = vi.fn();
    wordleState = {
      ...wordleState,
      current: "AP",
      refresh,
      showDictionaryChecksumDialog: true,
      acknowledgeDictionaryChecksumChange,
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

    expect(result.current.showDictionaryChecksumDialog).toBe(true);

    act(() => {
      result.current.confirmDictionaryChecksumRefresh();
    });

    expect(acknowledgeDictionaryChecksumChange).toHaveBeenCalledTimes(1);
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
    expect(refreshRemoteChecksum).toHaveBeenCalledWith(WORDS_DEFAULT_LANGUAGE);
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
