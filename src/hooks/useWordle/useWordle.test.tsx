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

describe("useWordle dictionary query integration", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    void i18n.changeLanguage("en");
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
});
