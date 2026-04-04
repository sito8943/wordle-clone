import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WORDS_CACHE_KEY_PREFIX, WORDS_DEFAULT_LANGUAGE } from "@api/words";
import { env } from "@config";
import { i18n } from "@i18n";
import useWordle from "./useWordle";
import {
  createHookWrapper,
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

  it("accepts Ñ as a valid letter in spanish", () => {
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

  it("ignores Ñ in english", () => {
    const loadWords = vi.fn().mockReturnValue(new Promise<string[]>(() => {}));
    const queryClient = createTestQueryClient();
    const wrapper = createHookWrapper(
      queryClient,
      createTestApiContextValue({
        wordDictionaryClient: createMockWordDictionaryClient(loadWords),
      }),
    );

    const { result } = renderHook(() => useWordle({ language: "en" }), {
      wrapper,
    });

    act(() => {
      result.current.handleKey("Ñ");
    });

    expect(result.current.current).toBe("");
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
    expect(result.current.message).toBe(i18n.t("play.gameplay.messages.notInWordList"));
  });
});
