import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { i18n, initI18n } from "@i18n";
import Scoreboard from "./Scoreboard";
import { useScoreboardController } from "./hooks";

vi.mock("./hooks", async () => {
  const actual = await vi.importActual<typeof import("./hooks")>("./hooks");
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

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

beforeAll(async () => {
  await initI18n();
});

beforeEach(async () => {
  await i18n.changeLanguage("en");
});

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

  it("lets the player switch between Classic, Lightning and Daily scoreboards", () => {
    mockController();
    render(<Scoreboard />);

    const lightningButton = screen.getByRole("button", { name: "Lightning" });
    fireEvent.click(lightningButton);

    expect(vi.mocked(useScoreboardController)).toHaveBeenLastCalledWith(
      "lightning",
    );

    const dailyButton = screen.getByRole("button", {
      name: i18n.t("gameModes.modes.daily.name"),
    });
    fireEvent.click(dailyButton);

    expect(vi.mocked(useScoreboardController)).toHaveBeenLastCalledWith(
      "daily",
    );
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

  it("shows backend not configured notice when convexEnabled is false", () => {
    mockController({ convexEnabled: false });
    render(<Scoreboard />);
    expect(screen.getByText(/Backend is not configured/)).toBeTruthy();
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

  it("applies smooth hover/clickable classes to score rows", () => {
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
      ],
    });
    render(<Scoreboard />);

    const playerButton = screen.getByRole("button", { name: "Ana" });
    const row = playerButton.closest("tr");

    expect(row?.className).toContain("cursor-pointer");
    expect(row?.className).toContain("transition-colors");
    expect(row?.className).toContain("duration-200");
  });

  it("does not render the date as a table header column", () => {
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
      ],
    });
    render(<Scoreboard />);
    expect(
      screen.queryByRole("columnheader", {
        name: i18n.t("scoreboard.headers.date"),
      }),
    ).toBeNull();
  });

  it("opens and closes the date dropdown when clicking a player name", () => {
    vi.useFakeTimers();
    try {
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
        ],
      });
      render(<Scoreboard />);

      const playerButton = screen.getByRole("button", { name: "Ana" });
      fireEvent.click(playerButton);
      expect(screen.getByText(i18n.t("scoreboard.headers.date"))).toBeTruthy();
      expect(screen.getByText("Jan 1")).toBeTruthy();

      fireEvent.click(playerButton);

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(screen.queryByText(i18n.t("scoreboard.headers.date"))).toBeNull();
      expect(screen.queryByText("Jan 1")).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it("positions dropdown above the row when there is not enough space below", () => {
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
      ],
    });
    render(<Scoreboard />);

    const originalInnerHeight = window.innerHeight;
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 100,
      writable: true,
    });

    try {
      const playerButton = screen.getByRole("button", { name: "Ana" });
      const playerRow = playerButton.closest("tr") as HTMLTableRowElement;
      vi.spyOn(playerRow, "getBoundingClientRect").mockReturnValue({
        x: 0,
        y: 70,
        width: 300,
        height: 24,
        top: 70,
        right: 300,
        bottom: 94,
        left: 0,
        toJSON: () => ({}),
      } as DOMRect);

      fireEvent.click(playerButton);

      const dropdownDate = screen.getByText("Jan 1");
      const dropdownRow = dropdownDate.closest("tr");
      expect(dropdownRow?.nextElementSibling).toBe(playerRow);
    } finally {
      Object.defineProperty(window, "innerHeight", {
        configurable: true,
        value: originalInnerHeight,
        writable: true,
      });
    }
  });

  it("switches dropdowns smoothly when clicking another row", () => {
    vi.useFakeTimers();
    try {
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
            streak: 0,
            formattedDate: "Jan 2",
            displayRank: 2,
            realRank: 2,
            isCurrentClient: false,
            isPinnedCurrentClient: false,
          },
        ],
      });
      render(<Scoreboard />);

      fireEvent.click(screen.getByRole("button", { name: "Ana" }));
      expect(screen.getByText("Jan 1")).toBeTruthy();

      fireEvent.click(screen.getByRole("button", { name: "Carlos" }));
      expect(screen.getByText("Jan 1")).toBeTruthy();
      expect(screen.queryByText("Jan 2")).toBeNull();

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(screen.queryByText("Jan 1")).toBeNull();
      expect(screen.getByText("Jan 2")).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
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

  it("shows shield icon for players who won daily today in any scoreboard", () => {
    mockController({
      scores: [
        {
          id: "1",
          nick: "Sito",
          score: 1,
          streak: 0,
          hasWonDailyToday: true,
          formattedDate: "Jan 1",
          displayRank: 1,
          realRank: 1,
          isCurrentClient: false,
          isPinnedCurrentClient: false,
        },
      ],
    });
    const { container } = render(<Scoreboard />);

    expect(container.querySelector('svg[data-icon="shield"]')).toBeTruthy();
  });

  it("does not show shield icon when the player has not won daily today", () => {
    mockController({
      scores: [
        {
          id: "1",
          nick: "Sito",
          score: 0,
          streak: 0,
          hasWonDailyToday: false,
          formattedDate: "Jan 1",
          displayRank: 1,
          realRank: 1,
          isCurrentClient: false,
          isPinnedCurrentClient: false,
        },
      ],
    });
    const { container } = render(<Scoreboard />);

    expect(container.querySelector('svg[data-icon="shield"]')).toBeNull();
  });
});
