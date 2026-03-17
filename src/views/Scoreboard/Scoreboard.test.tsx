import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Scoreboard from "./Scoreboard";
import { useScoreboardController } from "./hooks";

vi.mock("@hooks", async () => {
  const actual = await vi.importActual<typeof import("@hooks")>("@hooks");
  return { ...actual, useScoreboardController: vi.fn() };
});

const mockController = (overrides = {}) => {
  vi.mocked(useScoreboardController).mockReturnValue({
    convexEnabled: false,
    source: "local",
    loading: false,
    error: "",
    scores: [],
    currentClientRank: null,
    currentClientOutsideTop: false,
    refresh: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as ReturnType<typeof useScoreboardController>);
};

afterEach(cleanup);

describe("Scoreboard", () => {
  it("renders the heading", () => {
    mockController();
    render(<Scoreboard />);
    expect(screen.getByRole("heading", { name: "Scoreboard" })).toBeTruthy();
  });

  it("renders the Refresh button", () => {
    mockController();
    render(<Scoreboard />);
    expect(screen.getByRole("button", { name: "Refresh scores" })).toBeTruthy();
  });

  it("shows 'No scores yet.' when list is empty and not loading", () => {
    mockController();
    render(<Scoreboard />);
    expect(screen.getByText("No scores yet.")).toBeTruthy();
  });

  it("shows 'Loading scores...' when loading is true", () => {
    mockController({ loading: true });
    render(<Scoreboard />);
    expect(screen.getByText("Loading scores...")).toBeTruthy();
  });

  it("shows convex not configured notice when convexEnabled is false", () => {
    mockController({ convexEnabled: false });
    render(<Scoreboard />);
    expect(screen.getByText(/Convex is not configured/)).toBeTruthy();
  });

  it("shows offline fallback notice when convexEnabled but source is local", () => {
    mockController({ convexEnabled: true, source: "local" });
    render(<Scoreboard />);
    expect(screen.getByText(/Offline fallback active/)).toBeTruthy();
  });

  it("shows error message when error is set", () => {
    mockController({ error: "Failed to fetch scores" });
    render(<Scoreboard />);
    expect(screen.getByText("Failed to fetch scores")).toBeTruthy();
  });

  it("renders rows for each score entry", () => {
    mockController({
      scores: [
        {
          id: "1",
          nick: "Ana",
          score: 20,
          streak: 0,
          formattedDate: "Jan 1",
          displayRank: 1,
          realRank: 1,
          isCurrentClient: false,
          isPinnedCurrentClient: false,
        },
        {
          id: "2",
          nick: "Carlos",
          score: 15,
          streak: 3,
          formattedDate: "Jan 2",
          displayRank: 2,
          realRank: 2,
          isCurrentClient: false,
          isPinnedCurrentClient: false,
        },
      ],
    });
    render(<Scoreboard />);
    expect(screen.getByText("Ana")).toBeTruthy();
    expect(screen.getByText("Carlos")).toBeTruthy();
  });

  it("highlights the current client row", () => {
    mockController({
      scores: [
        {
          id: "me",
          nick: "Me",
          score: 10,
          streak: 0,
          formattedDate: "Jan 1",
          displayRank: 1,
          realRank: 1,
          isCurrentClient: true,
          isPinnedCurrentClient: false,
        },
      ],
    });
    const { container } = render(<Scoreboard />);
    const row = container.querySelector(".scoreboard-current-player-row");
    expect(row).toBeTruthy();
  });

  it("calls refresh when Refresh button is clicked", () => {
    const refresh = vi.fn().mockResolvedValue(undefined);
    mockController({ refresh });
    render(<Scoreboard />);
    fireEvent.click(screen.getByRole("button", { name: "Refresh scores" }));
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("shows real rank notice when current client is outside top", () => {
    mockController({
      currentClientOutsideTop: true,
      currentClientRank: 15,
      scores: Array.from({ length: 10 }, (_, i) => ({
        id: String(i),
        nick: `Player${i}`,
        score: 100 - i,
        streak: 0,
        formattedDate: "Jan 1",
        displayRank: i + 1,
        realRank: i + 1,
        isCurrentClient: false,
        isPinnedCurrentClient: false,
      })),
    });
    render(<Scoreboard />);
    expect(screen.getByText(/Real position: #15/)).toBeTruthy();
  });

  it("shows fire streak for entries with streak >= 2", () => {
    mockController({
      scores: [
        {
          id: "1",
          nick: "Sito",
          score: 30,
          streak: 5,
          formattedDate: "Jan 1",
          displayRank: 1,
          realRank: 1,
          isCurrentClient: false,
          isPinnedCurrentClient: false,
        },
      ],
    });
    const { container } = render(<Scoreboard />);
    expect(container.querySelector("svg")).toBeTruthy();
  });
});
