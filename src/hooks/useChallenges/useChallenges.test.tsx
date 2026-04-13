import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DAILY_CHALLENGES_PROGRESS_UPDATED_EVENT } from "@domain/challenges";
import { useChallenges } from "./useChallenges";

const mockUseApi = vi.fn();

vi.mock("@providers/Api", () => ({
  useApi: () => mockUseApi(),
}));

const createTodayChallenges = () => ({
  date: new Date().toISOString().slice(0, 10),
  simple: {
    id: "simple-1",
    name: "Steady Player",
    description: "Win a round",
    type: "simple" as const,
    conditionKey: "steady_player" as const,
  },
  complex: {
    id: "complex-1",
    name: "Speedster",
    description: "Win in less than 60 seconds",
    type: "complex" as const,
    conditionKey: "speedster" as const,
  },
});

describe("useChallenges", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    mockUseApi.mockReset();
  });

  afterEach(() => {
    window.sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("does not initialize when disabled", () => {
    const challengeClient = {
      isConfigured: true,
      seedChallenges: vi.fn(),
      getTodayChallenges: vi.fn(),
      generateDailyChallenges: vi.fn(),
      getPlayerChallengeProgress: vi.fn(),
    };
    mockUseApi.mockReturnValue({ challengeClient });

    const { result } = renderHook(() => useChallenges(false));

    expect(challengeClient.seedChallenges).not.toHaveBeenCalled();
    expect(result.current.challenges).toBeNull();
    expect(result.current.progress).toEqual([]);
    expect(result.current.showDialog).toBe(false);
  });

  it("loads today's challenges and auto-opens dialog when there are incomplete challenges", async () => {
    const todayChallenges = createTodayChallenges();
    const challengeClient = {
      isConfigured: true,
      seedChallenges: vi
        .fn()
        .mockResolvedValue({ inserted: 0, total: 0, alreadySeeded: true }),
      getTodayChallenges: vi.fn().mockResolvedValue(todayChallenges),
      generateDailyChallenges: vi.fn(),
      getPlayerChallengeProgress: vi.fn().mockResolvedValue([]),
    };
    mockUseApi.mockReturnValue({ challengeClient });

    const { result } = renderHook(() => useChallenges(true));

    await waitFor(() => {
      expect(challengeClient.seedChallenges).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(result.current.challenges).toEqual(todayChallenges);
    });

    expect(challengeClient.getTodayChallenges).toHaveBeenCalledWith(
      todayChallenges.date,
    );
    expect(challengeClient.generateDailyChallenges).not.toHaveBeenCalled();
    expect(result.current.showDialog).toBe(true);
    expect(
      window.sessionStorage.getItem("wordle:daily-challenges-dialog-seen"),
    ).toBe("seen");
  });

  it("generates today's challenges when they do not exist", async () => {
    const todayChallenges = createTodayChallenges();
    const challengeClient = {
      isConfigured: true,
      seedChallenges: vi
        .fn()
        .mockResolvedValue({ inserted: 0, total: 0, alreadySeeded: true }),
      getTodayChallenges: vi.fn().mockResolvedValue(null),
      generateDailyChallenges: vi.fn().mockResolvedValue(todayChallenges),
      getPlayerChallengeProgress: vi.fn().mockResolvedValue([
        {
          _id: "progress-1",
          profileId: "profile-1",
          challengeId: todayChallenges.simple.id,
          date: todayChallenges.date,
          completed: true,
          pointsAwarded: 5,
        },
        {
          _id: "progress-2",
          profileId: "profile-1",
          challengeId: todayChallenges.complex.id,
          date: todayChallenges.date,
          completed: true,
          pointsAwarded: 15,
        },
      ]),
    };
    mockUseApi.mockReturnValue({ challengeClient });

    renderHook(() => useChallenges(true));

    await waitFor(() => {
      expect(challengeClient.generateDailyChallenges).toHaveBeenCalledWith(
        todayChallenges.date,
      );
    });
  });

  it("refreshes progress when the custom progress-updated event is dispatched", async () => {
    const todayChallenges = createTodayChallenges();
    const challengeClient = {
      isConfigured: true,
      seedChallenges: vi
        .fn()
        .mockResolvedValue({ inserted: 0, total: 0, alreadySeeded: true }),
      getTodayChallenges: vi.fn().mockResolvedValue(todayChallenges),
      generateDailyChallenges: vi.fn(),
      getPlayerChallengeProgress: vi
        .fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          {
            _id: "progress-1",
            profileId: "profile-1",
            challengeId: todayChallenges.simple.id,
            date: todayChallenges.date,
            completed: true,
            pointsAwarded: 5,
          },
        ]),
    };
    mockUseApi.mockReturnValue({ challengeClient });

    const { result } = renderHook(() => useChallenges(true));

    await waitFor(() => {
      expect(challengeClient.getPlayerChallengeProgress).toHaveBeenCalledTimes(
        1,
      );
    });

    act(() => {
      window.dispatchEvent(new Event(DAILY_CHALLENGES_PROGRESS_UPDATED_EVENT));
    });

    await waitFor(() => {
      expect(challengeClient.getPlayerChallengeProgress).toHaveBeenCalledTimes(
        2,
      );
      expect(result.current.progress).toHaveLength(1);
      expect(result.current.progress[0].challengeId).toBe(
        todayChallenges.simple.id,
      );
    });
  });
});
