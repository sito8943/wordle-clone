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

const CHECKSUM_A = 12345;
const CHECKSUM_B = 99999;

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

  describe("checksum sync", () => {
    it("does not clear cache when checksums match", async () => {
      const clearCache = vi.fn();
      const loadWords = vi.fn().mockResolvedValue(["apple"]);
      const queryClient = createTestQueryClient();
      const wrapper = createHookWrapper(
        queryClient,
        createTestApiContextValue({
          wordDictionaryClient: createMockWordDictionaryClient(loadWords, {
            clearCache,
            getStoredChecksum: vi.fn().mockReturnValue(CHECKSUM_A),
            fetchRemoteChecksum: vi
              .fn()
              .mockResolvedValue({ checksum: CHECKSUM_A, updatedAt: 100 }),
          }),
        }),
      );

      renderHook(() => useDictionaryQuery(WORDS_DEFAULT_LANGUAGE), { wrapper });

      await waitFor(() => expect(loadWords).toHaveBeenCalled());

      expect(clearCache).not.toHaveBeenCalled();
    });

    it("clears cache and triggers re-fetch when checksum mismatches", async () => {
      const clearCache = vi.fn();
      const loadWords = vi.fn().mockResolvedValue(["apple"]);
      const queryClient = createTestQueryClient();
      const wrapper = createHookWrapper(
        queryClient,
        createTestApiContextValue({
          wordDictionaryClient: createMockWordDictionaryClient(loadWords, {
            clearCache,
            getStoredChecksum: vi.fn().mockReturnValue(CHECKSUM_A),
            fetchRemoteChecksum: vi
              .fn()
              .mockResolvedValue({ checksum: CHECKSUM_B, updatedAt: 200 }),
          }),
        }),
      );

      renderHook(() => useDictionaryQuery(WORDS_DEFAULT_LANGUAGE), { wrapper });

      await waitFor(() =>
        expect(clearCache).toHaveBeenCalledWith(WORDS_DEFAULT_LANGUAGE),
      );
      await waitFor(() => expect(loadWords).toHaveBeenCalledTimes(2));
    });

    it("does not clear cache when remote checksum is null", async () => {
      const clearCache = vi.fn();
      const fetchRemoteChecksum = vi.fn().mockResolvedValue(null);
      const loadWords = vi.fn().mockResolvedValue(["apple"]);
      const queryClient = createTestQueryClient();
      const wrapper = createHookWrapper(
        queryClient,
        createTestApiContextValue({
          wordDictionaryClient: createMockWordDictionaryClient(loadWords, {
            clearCache,
            getStoredChecksum: vi.fn().mockReturnValue(CHECKSUM_A),
            fetchRemoteChecksum,
          }),
        }),
      );

      renderHook(() => useDictionaryQuery(WORDS_DEFAULT_LANGUAGE), { wrapper });

      await waitFor(() => expect(fetchRemoteChecksum).toHaveBeenCalled());

      expect(clearCache).not.toHaveBeenCalled();
    });

    it("does not clear cache when no checksum is stored locally yet", async () => {
      const clearCache = vi.fn();
      const loadWords = vi.fn().mockResolvedValue(["apple"]);
      const queryClient = createTestQueryClient();
      const wrapper = createHookWrapper(
        queryClient,
        createTestApiContextValue({
          wordDictionaryClient: createMockWordDictionaryClient(loadWords, {
            clearCache,
            getStoredChecksum: vi.fn().mockReturnValue(null),
            fetchRemoteChecksum: vi
              .fn()
              .mockResolvedValue({ checksum: CHECKSUM_A, updatedAt: 100 }),
          }),
        }),
      );

      renderHook(() => useDictionaryQuery(WORDS_DEFAULT_LANGUAGE), { wrapper });

      await waitFor(() => expect(loadWords).toHaveBeenCalled());

      expect(clearCache).toHaveBeenCalledWith(WORDS_DEFAULT_LANGUAGE);
    });
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
