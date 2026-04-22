import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  WORDS_CACHE_KEY_PREFIX,
  WORDS_CHECKSUM_KEY_PREFIX,
  WORDS_DEFAULT_LANGUAGE,
} from "@api/words";
import { env } from "@config";
import { WORDLE_MODE_IDS } from "@domain/wordle";
import { i18n } from "@i18n";
import useWordle from "./useWordle";
import {
  createHookWrapper,
  createMockDailyWordClient,
  createMockWordDictionaryClient,
  createTestApiContextValue,
  createTestQueryClient,
} from "../../test/utils";

const dictionaryStorageKey = `${WORDS_CACHE_KEY_PREFIX}:${WORDS_DEFAULT_LANGUAGE}`;
const mockUseSound = vi.fn();

vi.mock("@providers/Sound", () => ({
  useSound: () => mockUseSound(),
}));

describe("useWordle dictionary query integration", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    void i18n.changeLanguage("en");
    mockUseSound.mockReset();
    mockUseSound.mockReturnValue({
      playSound: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("keeps dictionary loading true while query is pending without cache", () => {
    let resolveLoadWords!: (words: string[]) => void;
    const loadWords = vi.fn().mockReturnValue(
      new Promise<string[]>((resolve) => {
        resolveLoadWords = resolve;
      }),
    );
    const queryClient = createTestQueryClient();
    const wrapper = createHookWrapper(
      queryClient,
      createTestApiContextValue({
        wordDictionaryClient: createMockWordDictionaryClient(loadWords),
      }),
    );

    const { result } = renderHook(() => useWordle(), { wrapper });

    expect(result.current.dictionaryLoading).toBe(true);

    act(() => {
      resolveLoadWords(["apple"]);
    });
  });

  it("fills dictionary words from query success", async () => {
    const loadWords = vi.fn().mockResolvedValue(["apple", "berry"]);
    const queryClient = createTestQueryClient();
    const wrapper = createHookWrapper(
      queryClient,
      createTestApiContextValue({
        wordDictionaryClient: createMockWordDictionaryClient(loadWords),
      }),
    );

    const { result } = renderHook(() => useWordle(), { wrapper });

    await waitFor(() => {
      expect(result.current.dictionaryLoading).toBe(false);
    });

    expect(result.current.dictionaryWords).toEqual(["apple", "berry"]);
    expect(result.current.dictionaryError).toBeNull();
  });

  it("falls back to cached words on query error", async () => {
    localStorage.setItem(dictionaryStorageKey, JSON.stringify(["apple"]));

    const loadWords = vi.fn().mockRejectedValue(new Error("dictionary down"));
    const queryClient = createTestQueryClient();
    const wrapper = createHookWrapper(
      queryClient,
      createTestApiContextValue({
        wordDictionaryClient: createMockWordDictionaryClient(loadWords),
      }),
    );

    const { result } = renderHook(() => useWordle(), { wrapper });

    await waitFor(() => {
      expect(result.current.dictionaryLoading).toBe(false);
    });

    expect(result.current.dictionaryWords).toEqual(["apple"]);
    expect(result.current.dictionaryError).toBeNull();
  });

  it("keeps unavailable error message when query returns empty dictionary", async () => {
    const loadWords = vi.fn().mockResolvedValue([]);
    const queryClient = createTestQueryClient();
    const wrapper = createHookWrapper(
      queryClient,
      createTestApiContextValue({
        wordDictionaryClient: createMockWordDictionaryClient(loadWords),
      }),
    );

    const { result } = renderHook(() => useWordle(), { wrapper });

    await waitFor(() => {
      expect(result.current.dictionaryLoading).toBe(false);
    });

    expect(result.current.dictionaryWords).toEqual([]);
    expect(result.current.dictionaryError).toBe(
      i18n.t("play.toolbar.wordListUnavailable"),
    );
  });

  it("defers game persistence while typing and flushes after the debounce", () => {
    vi.useFakeTimers();

    const loadWords = vi.fn().mockReturnValue(new Promise<string[]>(() => {}));
    const queryClient = createTestQueryClient();
    const wrapper = createHookWrapper(
      queryClient,
      createTestApiContextValue({
        wordDictionaryClient: createMockWordDictionaryClient(loadWords),
      }),
    );

    const { result } = renderHook(() => useWordle(), { wrapper });

    act(() => {
      result.current.handleKey("A");
    });

    expect(localStorage.getItem(env.wordleGameStorageKey)).toBeNull();

    act(() => {
      vi.advanceTimersByTime(149);
    });

    expect(localStorage.getItem(env.wordleGameStorageKey)).toBeNull();

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(localStorage.getItem(env.wordleGameStorageKey)).toContain(
      '"current":"A"',
    );
  });

  it("supports manual tile selection without automatic cursor advance", () => {
    const loadWords = vi.fn().mockReturnValue(new Promise<string[]>(() => {}));
    const queryClient = createTestQueryClient();
    const wrapper = createHookWrapper(
      queryClient,
      createTestApiContextValue({
        wordDictionaryClient: createMockWordDictionaryClient(loadWords),
      }),
    );

    const { result } = renderHook(
      () => useWordle({ manualTileSelection: true }),
      { wrapper },
    );

    expect(result.current.activeTileIndex).toBe(0);

    act(() => {
      result.current.handleKey("A");
    });
    expect(result.current.current).toBe("A");
    expect(result.current.activeTileIndex).toBe(0);

    act(() => {
      result.current.handleKey("B");
    });
    expect(result.current.current).toBe("B");
    expect(result.current.activeTileIndex).toBe(0);

    act(() => {
      result.current.selectActiveTile(1);
    });
    act(() => {
      result.current.handleKey("C");
    });
    expect(result.current.current).toBe("BC");
    expect(result.current.activeTileIndex).toBe(1);
  });

  it("respects custom round config limits for row length", () => {
    const loadWords = vi.fn().mockReturnValue(new Promise<string[]>(() => {}));
    const queryClient = createTestQueryClient();
    const wrapper = createHookWrapper(
      queryClient,
      createTestApiContextValue({
        wordDictionaryClient: createMockWordDictionaryClient(loadWords),
      }),
    );

    const { result } = renderHook(
      () =>
        useWordle({
          roundConfig: { lettersPerRow: 3, maxGuesses: 6 },
        }),
      { wrapper },
    );

    act(() => {
      result.current.handleKey("A");
      result.current.handleKey("B");
      result.current.handleKey("C");
      result.current.handleKey("D");
    });

    expect(result.current.current).toBe("ABC");
    expect(result.current.roundConfig.lettersPerRow).toBe(3);
  });

  it("reveals hints in the first empty slot when manual input has gaps", () => {
    const loadWords = vi.fn().mockReturnValue(new Promise<string[]>(() => {}));
    const queryClient = createTestQueryClient();
    const wrapper = createHookWrapper(
      queryClient,
      createTestApiContextValue({
        wordDictionaryClient: createMockWordDictionaryClient(loadWords),
      }),
    );

    const { result } = renderHook(
      () => useWordle({ manualTileSelection: true }),
      { wrapper },
    );

    act(() => {
      result.current.handleKey("A");
    });
    act(() => {
      result.current.selectActiveTile(2);
    });
    act(() => {
      result.current.handleKey("C");
    });
    act(() => {
      result.current.selectActiveTile(4);
    });
    act(() => {
      result.current.handleKey("E");
    });

    expect(result.current.current).toBe("A C E");

    let hintRevealed = false;
    act(() => {
      hintRevealed = result.current.revealHint("correct");
    });

    expect(hintRevealed).toBe(true);
    expect(result.current.hintRevealTileIndex).toBe(1);
    expect(result.current.current[1]).not.toBe(" ");
    expect(result.current.current[3]).toBe(" ");
  });

  it("accepts Ñ as a valid letter by default", () => {
    const loadWords = vi.fn().mockReturnValue(new Promise<string[]>(() => {}));
    const queryClient = createTestQueryClient();
    const wrapper = createHookWrapper(
      queryClient,
      createTestApiContextValue({
        wordDictionaryClient: createMockWordDictionaryClient(loadWords),
      }),
    );

    const { result } = renderHook(() => useWordle(), { wrapper });

    act(() => {
      result.current.handleKey("Ñ");
    });

    expect(result.current.current).toBe("Ñ");
  });

  it("accepts Ñ when language is explicitly set to spanish", () => {
    const loadWords = vi.fn().mockReturnValue(new Promise<string[]>(() => {}));
    const queryClient = createTestQueryClient();
    const wrapper = createHookWrapper(
      queryClient,
      createTestApiContextValue({
        wordDictionaryClient: createMockWordDictionaryClient(loadWords),
      }),
    );

    const { result } = renderHook(() => useWordle({ language: "es" }), {
      wrapper,
    });

    act(() => {
      result.current.handleKey("Ñ");
    });

    expect(result.current.current).toBe("Ñ");
  });

  it("removes the selected letter with backspace in manual mode", () => {
    const loadWords = vi.fn().mockReturnValue(new Promise<string[]>(() => {}));
    const queryClient = createTestQueryClient();
    const wrapper = createHookWrapper(
      queryClient,
      createTestApiContextValue({
        wordDictionaryClient: createMockWordDictionaryClient(loadWords),
      }),
    );

    const { result } = renderHook(
      () => useWordle({ manualTileSelection: true }),
      { wrapper },
    );

    act(() => {
      result.current.handleKey("A");
    });
    act(() => {
      result.current.selectActiveTile(1);
    });
    act(() => {
      result.current.handleKey("B");
    });
    expect(result.current.current).toBe("AB");

    act(() => {
      result.current.selectActiveTile(0);
    });
    act(() => {
      result.current.handleKey("BACKSPACE");
    });
    expect(result.current.current).toBe("B");
    expect(result.current.activeTileIndex).toBe(0);
  });

  it("moves active tile with arrow keys in manual mode", () => {
    const loadWords = vi.fn().mockReturnValue(new Promise<string[]>(() => {}));
    const queryClient = createTestQueryClient();
    const wrapper = createHookWrapper(
      queryClient,
      createTestApiContextValue({
        wordDictionaryClient: createMockWordDictionaryClient(loadWords),
      }),
    );

    const { result } = renderHook(
      () => useWordle({ manualTileSelection: true }),
      { wrapper },
    );

    act(() => {
      result.current.handleKey("A");
    });
    act(() => {
      result.current.selectActiveTile(1);
    });
    act(() => {
      result.current.handleKey("B");
    });
    expect(result.current.current).toBe("AB");
    expect(result.current.activeTileIndex).toBe(1);

    act(() => {
      result.current.handleKey("ARROWLEFT");
    });
    expect(result.current.activeTileIndex).toBe(0);

    act(() => {
      result.current.handleKey("ARROWRIGHT");
    });
    expect(result.current.activeTileIndex).toBe(1);

    act(() => {
      result.current.handleKey("ARROWRIGHT");
    });
    act(() => {
      result.current.handleKey("ARROWRIGHT");
    });
    expect(result.current.activeTileIndex).toBe(3);
  });

  it("plays keyboard sounds when adding and deleting letters", () => {
    const playSound = vi.fn();
    mockUseSound.mockReturnValue({
      playSound,
    });

    const loadWords = vi.fn().mockReturnValue(new Promise<string[]>(() => {}));
    const queryClient = createTestQueryClient();
    const wrapper = createHookWrapper(
      queryClient,
      createTestApiContextValue({
        wordDictionaryClient: createMockWordDictionaryClient(loadWords),
      }),
    );

    const { result } = renderHook(() => useWordle(), { wrapper });

    act(() => {
      result.current.handleKey("A");
    });
    act(() => {
      result.current.handleKey("BACKSPACE");
    });

    expect(playSound).toHaveBeenCalledWith("letter_put");
    expect(playSound).toHaveBeenCalledWith("letter_delete");
  });

  it("plays invalid submit sound and increases board shake pulse on invalid enter", async () => {
    const playSound = vi.fn();
    mockUseSound.mockReturnValue({
      playSound,
    });

    const loadWords = vi.fn().mockResolvedValue(["APPLE", "CRANE"]);
    const queryClient = createTestQueryClient();
    const wrapper = createHookWrapper(
      queryClient,
      createTestApiContextValue({
        wordDictionaryClient: createMockWordDictionaryClient(loadWords),
      }),
    );

    const { result } = renderHook(() => useWordle(), { wrapper });

    await waitFor(() => {
      expect(result.current.dictionaryLoading).toBe(false);
    });

    act(() => {
      result.current.handleKey("Z");
      result.current.handleKey("Z");
      result.current.handleKey("Z");
      result.current.handleKey("Z");
      result.current.handleKey("Z");
    });
    act(() => {
      result.current.handleKey("ENTER");
    });

    expect(playSound).toHaveBeenCalledWith("guess_invalid");
    expect(result.current.invalidGuessShakePulse).toBe(1);
    expect(result.current.message).toBe(
      i18n.t("play.gameplay.messages.notInWordList"),
    );
  });

  it("opens a checksum dialog when dictionary checksum changes during an active game", async () => {
    const checksumStorageKey = `${WORDS_CHECKSUM_KEY_PREFIX}:${WORDS_DEFAULT_LANGUAGE}`;
    localStorage.setItem(dictionaryStorageKey, JSON.stringify(["apple"]));
    localStorage.setItem(checksumStorageKey, JSON.stringify(100));
    localStorage.setItem(
      env.wordleGameStorageKey,
      JSON.stringify({
        sessionId: "session-1",
        gameId: "game-1",
        seed: 1,
        startedAt: 1_000,
        guesses: [],
        current: "AP",
        gameOver: false,
      }),
    );

    const loadWords = vi.fn().mockResolvedValue(["berry", "crane"]);
    const queryClient = createTestQueryClient();
    const wrapper = createHookWrapper(
      queryClient,
      createTestApiContextValue({
        wordDictionaryClient: createMockWordDictionaryClient(loadWords, {
          getStoredChecksum: vi.fn().mockReturnValue(100),
          fetchRemoteChecksum: vi
            .fn()
            .mockResolvedValue({ checksum: 200, updatedAt: 2_000 }),
          clearCache: vi.fn(),
        }),
      }),
    );

    const { result } = renderHook(() => useWordle(), { wrapper });

    await waitFor(() => {
      expect(result.current.showDictionaryChecksumDialog).toBe(true);
    });

    act(() => {
      result.current.handleKey("B");
    });

    expect(result.current.current).toBe("AP");

    act(() => {
      result.current.acknowledgeDictionaryChecksumChange();
    });

    expect(result.current.showDictionaryChecksumDialog).toBe(false);
  });

  it("uses daily word client in daily mode and adapts row length", async () => {
    const loadWords = vi.fn().mockResolvedValue(["casa", "luz", "puente"]);
    const getDailyWord = vi.fn().mockResolvedValue("PUENTE");
    const queryClient = createTestQueryClient();
    const wrapper = createHookWrapper(
      queryClient,
      createTestApiContextValue({
        wordDictionaryClient: createMockWordDictionaryClient(loadWords),
        dailyWordClient: createMockDailyWordClient(getDailyWord),
      }),
    );

    const { result } = renderHook(
      () =>
        useWordle({
          modeId: WORDLE_MODE_IDS.DAILY,
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.dictionaryLoading).toBe(false);
    });

    await waitFor(() => {
      expect(result.current.roundConfig.lettersPerRow).toBe(6);
    });

    expect(result.current.answer).toBe("PUENTE");
    expect(getDailyWord).toHaveBeenCalledOnce();
  });

  it("falls back to deterministic dictionary word when remote daily word is invalid", async () => {
    const loadWords = vi.fn().mockResolvedValue(["casa", "luz", "mar"]);
    const queryClient = createTestQueryClient();
    const wrapper = createHookWrapper(
      queryClient,
      createTestApiContextValue({
        wordDictionaryClient: createMockWordDictionaryClient(loadWords),
        dailyWordClient: createMockDailyWordClient(
          vi.fn().mockResolvedValue("INEXISTENTE"),
        ),
      }),
    );

    const { result } = renderHook(
      () =>
        useWordle({
          modeId: WORDLE_MODE_IDS.DAILY,
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.dictionaryLoading).toBe(false);
    });

    await waitFor(() => {
      expect(["CASA", "LUZ", "MAR"]).toContain(result.current.answer);
    });

    expect(result.current.answer).not.toBe("INEXISTENTE");
    expect(result.current.roundConfig.lettersPerRow).toBe(
      result.current.answer.length,
    );
  });
});
