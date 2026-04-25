import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDailyModePrerequisites } from "./useDailyModePrerequisites";
import {
  createHookWrapper,
  createMockDailyWordClient,
  createTestApiContextValue,
  createTestQueryClient,
} from "../../test/utils";

describe("useDailyModePrerequisites", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("returns ready when daily word and meaning are available", async () => {
    const getDailyWord = vi.fn().mockResolvedValue("APPLE");
    const getDailyMeaning = vi.fn().mockResolvedValue("A fruit.");
    const queryClient = createTestQueryClient();
    const wrapper = createHookWrapper(
      queryClient,
      createTestApiContextValue({
        dailyWordClient: createMockDailyWordClient(
          getDailyWord,
          getDailyMeaning,
        ),
      }),
    );

    const { result } = renderHook(() => useDailyModePrerequisites(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.status).toBe("ready");
    });

    expect(result.current.dailyWord).toBe("APPLE");
    expect(result.current.dailyMeaning).toBe("A fruit.");
    expect(getDailyWord).toHaveBeenCalledWith(expect.any(String));
    expect(getDailyMeaning).toHaveBeenCalledWith("APPLE", expect.any(String));
  });

  it("uses cached daily requirements without refetching", async () => {
    const getDailyWord = vi.fn().mockResolvedValue("APPLE");
    const getDailyMeaning = vi.fn().mockResolvedValue("A fruit.");
    const queryClient = createTestQueryClient();
    const wrapper = createHookWrapper(
      queryClient,
      createTestApiContextValue({
        dailyWordClient: createMockDailyWordClient(
          getDailyWord,
          getDailyMeaning,
          {
            getCachedWord: vi.fn().mockReturnValue("APPLE"),
            getCachedMeaning: vi.fn().mockReturnValue("A fruit."),
          },
        ),
      }),
    );

    const { result } = renderHook(() => useDailyModePrerequisites(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.status).toBe("ready");
    });

    expect(result.current.dailyWord).toBe("APPLE");
    expect(result.current.dailyMeaning).toBe("A fruit.");
    expect(getDailyWord).not.toHaveBeenCalled();
    expect(getDailyMeaning).not.toHaveBeenCalled();
  });

  it("returns unavailable when daily word cannot be loaded", async () => {
    const getDailyWord = vi.fn().mockResolvedValue(null);
    const getDailyMeaning = vi.fn().mockResolvedValue("A fruit.");
    const queryClient = createTestQueryClient();
    const wrapper = createHookWrapper(
      queryClient,
      createTestApiContextValue({
        dailyWordClient: createMockDailyWordClient(
          getDailyWord,
          getDailyMeaning,
        ),
      }),
    );

    const { result } = renderHook(() => useDailyModePrerequisites(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.status).toBe("unavailable");
    });

    expect(result.current.dailyWord).toBeNull();
    expect(result.current.dailyMeaning).toBeNull();
    expect(getDailyMeaning).not.toHaveBeenCalled();
  });

  it("returns unavailable when daily meaning cannot be loaded", async () => {
    const getDailyWord = vi.fn().mockResolvedValue("APPLE");
    const getDailyMeaning = vi.fn().mockResolvedValue(null);
    const queryClient = createTestQueryClient();
    const wrapper = createHookWrapper(
      queryClient,
      createTestApiContextValue({
        dailyWordClient: createMockDailyWordClient(
          getDailyWord,
          getDailyMeaning,
        ),
      }),
    );

    const { result } = renderHook(() => useDailyModePrerequisites(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.status).toBe("unavailable");
    });

    expect(result.current.dailyWord).toBe("APPLE");
    expect(result.current.dailyMeaning).toBeNull();
  });
});
