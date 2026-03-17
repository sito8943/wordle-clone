import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WORDS_DEFAULT_LANGUAGE } from "@api/words";
import useDictionaryQuery from "./useDictionaryQuery";
import {
  createHookWrapper,
  createMockWordDictionaryClient,
  createTestApiContextValue,
  createTestQueryClient,
} from "../test/utils";

describe("useDictionaryQuery", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("exposes loading before dictionary words resolve", () => {
    const loadWords = vi.fn().mockReturnValue(new Promise<string[]>(() => {}));
    const queryClient = createTestQueryClient();
    const wrapper = createHookWrapper(
      queryClient,
      createTestApiContextValue({
        wordDictionaryClient: createMockWordDictionaryClient(loadWords),
      }),
    );

    const { result } = renderHook(
      () => useDictionaryQuery(WORDS_DEFAULT_LANGUAGE),
      { wrapper },
    );

    expect(result.current.isLoading).toBe(true);
  });

  it("returns dictionary words on success", async () => {
    const loadWords = vi.fn().mockResolvedValue(["apple", "berry"]);
    const queryClient = createTestQueryClient();
    const wrapper = createHookWrapper(
      queryClient,
      createTestApiContextValue({
        wordDictionaryClient: createMockWordDictionaryClient(loadWords),
      }),
    );

    const { result } = renderHook(
      () => useDictionaryQuery(WORDS_DEFAULT_LANGUAGE),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(["apple", "berry"]);
    expect(loadWords).toHaveBeenCalledWith(WORDS_DEFAULT_LANGUAGE);
  });

  it("exposes query error when dictionary load fails", async () => {
    const loadWords = vi.fn().mockRejectedValue(new Error("dictionary down"));
    const queryClient = createTestQueryClient();
    const wrapper = createHookWrapper(
      queryClient,
      createTestApiContextValue({
        wordDictionaryClient: createMockWordDictionaryClient(loadWords),
      }),
    );

    const { result } = renderHook(
      () => useDictionaryQuery(WORDS_DEFAULT_LANGUAGE),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect((result.current.error as Error).message).toBe("dictionary down");
  });

  it("uses initial cached words as initial data", async () => {
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

    const { result } = renderHook(
      () => useDictionaryQuery(WORDS_DEFAULT_LANGUAGE, ["cache"]),
      { wrapper },
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual(["cache"]);

    act(() => {
      resolveLoadWords(["apple"]);
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(["apple"]);
    });
  });
});
