import {
  act,
  cleanup,
  fireEvent,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { ScoreClient, type TopScoresResult } from "@api/score";
import { UPDATE_SCORE_MUTATION } from "@api/score/constants";
import { WORDS_DEFAULT_LANGUAGE, WordDictionaryClient } from "@api/words";
import { env } from "@config";
import {
  WORDLE_ANIMATIONS_DISABLED_STORAGE_KEY,
  WORDLE_KEYBOARD_ENTRY_ANIMATION_SESSION_KEY,
  WORDLE_START_ANIMATION_SESSION_KEY,
} from "@domain/wordle";
import { HINT_USAGE_STORAGE_KEY } from "@hooks/useHomeController/useHintController";
import { THEME_PREFERENCE_STORAGE_KEY } from "@hooks/useThemePreference";
import { ApiProvider, PlayerProvider } from "@providers";
import { renderWithQueryClient } from "./test/utils";

vi.mock("./utils/words", async () => {
  const actual =
    await vi.importActual<typeof import("@utils/words")>("./utils/words");

  return {
    ...actual,
    getRandomWord: () => "APPLE",
  };
});

const renderApp = () =>
  renderWithQueryClient(
    <ApiProvider>
      <PlayerProvider>
        <App />
      </PlayerProvider>
    </ApiProvider>,
  );

const defaultEnvMode = env.mode;
const defaultEnvConvexUrl = env.convexUrl;

const mockSystemTheme = (mode: "light" | "dark") => {
  const prefersDark = mode === "dark";

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: prefersDark,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

describe("App", () => {
  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  beforeEach(() => {
    env.mode = defaultEnvMode;
    env.convexUrl = defaultEnvConvexUrl;
    localStorage.clear();
    sessionStorage.clear();
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.remove("wordle-animations-disabled");
    document.documentElement.style.colorScheme = "";
    mockSystemTheme("light");
    window.history.pushState({}, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
  });

  it("renders the main navigation", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({ name: "TestUser", score: 0, streak: 0 }),
    );
    renderApp();

    expect(await screen.findByRole("heading", { name: "WORDLE" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Play" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Profile" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Scoreboard" })).toBeTruthy();
  });

  it("shows a spinner in scoreboard navbar label while rank is loading", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({ name: "Player", score: 0, streak: 0 }),
    );

    let resolveListTopScores!: (value: TopScoresResult) => void;
    const listTopScoresPromise = new Promise<TopScoresResult>((resolve) => {
      resolveListTopScores = resolve;
    });
    const listTopScoresSpy = vi
      .spyOn(ScoreClient.prototype, "listTopScores")
      .mockReturnValue(listTopScoresPromise);

    try {
      renderApp();

      const scoreboardLink = await screen.findByRole("link", {
        name: "Scoreboard",
      });
      expect(
        scoreboardLink.querySelector('[data-testid="scoreboard-rank-spinner"]'),
      ).toBeTruthy();

      resolveListTopScores({
        scores: [],
        source: "local",
        currentClientRank: null,
        currentClientEntry: null,
      });

      await waitFor(() => {
        expect(
          scoreboardLink.querySelector(
            '[data-testid="scoreboard-rank-spinner"]',
          ),
        ).toBeNull();
        expect(scoreboardLink.textContent).toContain("#--");
      });
    } finally {
      listTopScoresSpy.mockRestore();
    }
  });

  it("asks for the player name on first app launch", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({ name: "Player", score: 0, streak: 0 }),
    );
    renderApp();

    expect(
      await screen.findByRole("dialog", { name: "Welcome to Wordle" }),
    ).toBeTruthy();

    const nameInput = screen.getByLabelText("Player nick name");
    fireEvent.change(nameInput, { target: { value: "Ana" } });
    fireEvent.click(screen.getByRole("button", { name: "Start playing" }));

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "Welcome to Wordle" }),
      ).toBeNull();
    });

    await waitFor(() => {
      const player = JSON.parse(localStorage.getItem("player") || "{}");
      expect(player.name).toBe("Ana");
    });
  });

  it("prevents duplicated player name on first app launch", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({ name: "Player", score: 0, streak: 0 }),
    );
    localStorage.setItem(
      "wordle:scoreboard:cache",
      JSON.stringify([
        {
          localId: "other-player",
          clientId: "other-client",
          nick: "Ana",
          score: 20,
          streak: 3,
          createdAt: 1000,
        },
      ]),
    );

    renderApp();

    const nameInput = await screen.findByLabelText("Player nick name");
    fireEvent.change(nameInput, { target: { value: "Ana" } });
    fireEvent.click(screen.getByRole("button", { name: "Start playing" }));

    expect(await screen.findByText("Name is not available.")).toBeTruthy();
    expect(
      screen.getByRole("dialog", { name: "Welcome to Wordle" }),
    ).toBeTruthy();

    const player = JSON.parse(localStorage.getItem("player") || "{}");
    expect(player.name).toBe("Player");
  });

  it("defaults to system theme preference", async () => {
    mockSystemTheme("dark");
    localStorage.setItem(
      "player",
      JSON.stringify({ name: "Player", score: 0, streak: 0 }),
    );

    renderApp();

    expect(await screen.findByRole("heading", { name: "WORDLE" })).toBeTruthy();
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem(THEME_PREFERENCE_STORAGE_KEY)).toBe(
      JSON.stringify("system"),
    );
  });

  it("lets user change theme mode from profile", async () => {
    mockSystemTheme("dark");
    localStorage.setItem(
      "player",
      JSON.stringify({ name: "Player", score: 0, streak: 0 }),
    );

    renderApp();

    fireEvent.click(screen.getByRole("link", { name: "Profile" }));
    expect(
      await screen.findByRole("heading", { name: "Profile" }),
    ).toBeTruthy();

    const themeSelect = screen.getByLabelText(
      "Theme mode",
    ) as HTMLSelectElement;
    expect(themeSelect.value).toBe("system");
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    fireEvent.change(themeSelect, { target: { value: "light" } });

    await waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });

    fireEvent.change(themeSelect, { target: { value: "dark" } });

    await waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
  });

  it("defaults to normal difficulty from profile when missing in storage", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({ name: "Player", score: 0, streak: 0 }),
    );

    renderApp();

    fireEvent.click(screen.getByRole("link", { name: "Profile" }));
    expect(
      await screen.findByRole("heading", { name: "Profile" }),
    ).toBeTruthy();

    const difficultySelect = screen.getByLabelText(
      "Difficulty",
    ) as HTMLSelectElement;
    expect(difficultySelect.value).toBe("normal");

    await waitFor(() => {
      const player = JSON.parse(localStorage.getItem("player") || "{}");
      expect(player.difficulty).toBe("normal");
    });
  });

  it("lets user change difficulty from profile", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({ name: "Player", score: 0, streak: 0 }),
    );

    renderApp();

    fireEvent.click(screen.getByRole("link", { name: "Profile" }));
    expect(
      await screen.findByRole("heading", { name: "Profile" }),
    ).toBeTruthy();

    const difficultySelect = screen.getByLabelText(
      "Difficulty",
    ) as HTMLSelectElement;
    expect(difficultySelect.value).toBe("normal");

    fireEvent.change(difficultySelect, { target: { value: "easy" } });

    await waitFor(() => {
      const player = JSON.parse(localStorage.getItem("player") || "{}");
      expect(player.difficulty).toBe("easy");
    });

    fireEvent.change(difficultySelect, { target: { value: "hard" } });

    await waitFor(() => {
      const player = JSON.parse(localStorage.getItem("player") || "{}");
      expect(player.difficulty).toBe("hard");
    });

    fireEvent.change(difficultySelect, { target: { value: "insane" } });

    await waitFor(() => {
      const player = JSON.parse(localStorage.getItem("player") || "{}");
      expect(player.difficulty).toBe("insane");
    });
  });

  it("lets user change keyboard mode from profile", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({ name: "Player", score: 0, streak: 0 }),
    );

    renderApp();

    fireEvent.click(screen.getByRole("link", { name: "Profile" }));
    expect(
      await screen.findByRole("heading", { name: "Profile" }),
    ).toBeTruthy();

    const keyboardModeSelect = screen.getByLabelText(
      "Keyboard mode",
    ) as HTMLSelectElement;
    expect(keyboardModeSelect.value).toBe("onscreen");

    fireEvent.change(keyboardModeSelect, { target: { value: "native" } });

    await waitFor(() => {
      const player = JSON.parse(localStorage.getItem("player") || "{}");
      expect(player.keyboardPreference).toBe("native");
    });
  });

  it("hides developer console button outside development mode", () => {
    localStorage.setItem(
      "player",
      JSON.stringify({ name: "Player", score: 0, streak: 0 }),
    );

    renderApp();

    expect(
      screen.queryByRole("button", { name: "Developer console" }),
    ).toBeNull();
  });

  it("shows developer console in develpment mode and updates current player", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({ name: "Player", score: 0, streak: 0 }),
    );
    env.mode = "develpment";
    const recordScoreSpy = vi
      .spyOn(ScoreClient.prototype, "recordScore")
      .mockResolvedValue();

    try {
      renderApp();

      fireEvent.click(
        await screen.findByRole("button", { name: "Developer console" }),
      );

      expect(
        await screen.findByRole("dialog", { name: "Developer console" }),
      ).toBeTruthy();

      fireEvent.change(screen.getByLabelText("Player name"), {
        target: { value: "DevUser" },
      });
      fireEvent.change(screen.getByLabelText("Score"), {
        target: { value: "42" },
      });
      fireEvent.change(screen.getByLabelText("Streak"), {
        target: { value: "7" },
      });
      fireEvent.change(screen.getByLabelText("Difficulty"), {
        target: { value: "hard" },
      });
      fireEvent.change(screen.getByLabelText("Keyboard mode"), {
        target: { value: "native" },
      });

      fireEvent.click(screen.getByRole("button", { name: "Apply" }));

      await waitFor(() => {
        expect(
          screen.queryByRole("dialog", { name: "Developer console" }),
        ).toBeNull();
      });
      await waitFor(() => {
        const player = JSON.parse(localStorage.getItem("player") || "{}");
        expect(player.name).toBe("DevUser");
        expect(player.score).toBe(42);
        expect(player.streak).toBe(7);
        expect(player.difficulty).toBe("hard");
        expect(player.keyboardPreference).toBe("native");
      });

      expect(recordScoreSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          nick: "DevUser",
          score: 42,
          streak: 7,
          overwriteExisting: true,
        }),
        UPDATE_SCORE_MUTATION,
      );
      expect(screen.getByLabelText("Streak: 7")).toBeTruthy();
    } finally {
      recordScoreSpy.mockRestore();
    }
  });

  it("syncs scoreboard with score overrides from developer console", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({ name: "Player", score: 80, streak: 5 }),
    );
    localStorage.setItem("wordle:scoreboard:client-id", "dev-client");
    localStorage.setItem(
      "wordle:scoreboard:cache",
      JSON.stringify([
        {
          localId: "dev-row",
          clientId: "dev-client",
          nick: "Player",
          score: 80,
          streak: 5,
          createdAt: 1000,
        },
      ]),
    );
    env.mode = "develpment";
    env.convexUrl = undefined;

    renderApp();

    fireEvent.click(
      await screen.findByRole("button", { name: "Developer console" }),
    );
    expect(
      await screen.findByRole("dialog", { name: "Developer console" }),
    ).toBeTruthy();

    fireEvent.change(screen.getByLabelText("Score"), {
      target: { value: "12" },
    });
    fireEvent.change(screen.getByLabelText("Streak"), {
      target: { value: "1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "Developer console" }),
      ).toBeNull();
    });

    fireEvent.click(screen.getByRole("link", { name: "Scoreboard" }));
    expect(
      await screen.findByRole("heading", { name: "Scoreboard" }),
    ).toBeTruthy();

    await waitFor(() => {
      const currentRow = document.querySelector(
        ".scoreboard-current-player-row",
      );
      expect(currentRow).toBeTruthy();
      expect(currentRow?.textContent).toContain("12");
    });
  });

  it("refreshes remote dictionary checksum from developer console", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({ name: "Player", score: 0, streak: 0 }),
    );
    env.mode = "develpment";
    const refreshRemoteChecksumSpy = vi
      .spyOn(WordDictionaryClient.prototype, "refreshRemoteChecksum")
      .mockResolvedValue({ checksum: 10101, updatedAt: 123 });

    try {
      renderApp();

      fireEvent.click(
        await screen.findByRole("button", { name: "Developer console" }),
      );
      expect(
        await screen.findByRole("dialog", { name: "Developer console" }),
      ).toBeTruthy();

      fireEvent.click(
        screen.getByRole("button", { name: "Refresh remote checksum" }),
      );

      await waitFor(() => {
        expect(refreshRemoteChecksumSpy).toHaveBeenCalledWith(
          WORDS_DEFAULT_LANGUAGE,
        );
      });
      expect(
        await screen.findByText("Remote checksum updated to 10101."),
      ).toBeTruthy();
    } finally {
      refreshRemoteChecksumSpy.mockRestore();
    }
  });

  it("shows word list button only in easy difficulty", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({
        name: "Player",
        score: 0,
        streak: 0,
        difficulty: "normal",
      }),
    );

    renderApp();

    expect(screen.queryByRole("button", { name: "Word list" })).toBeNull();

    fireEvent.click(screen.getByRole("link", { name: "Profile" }));
    expect(
      await screen.findByRole("heading", { name: "Profile" }),
    ).toBeTruthy();

    fireEvent.change(screen.getByLabelText("Difficulty"), {
      target: { value: "easy" },
    });
    fireEvent.click(screen.getByRole("link", { name: "Play" }));

    expect(
      await screen.findByRole("button", { name: "Word list" }),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("link", { name: "Profile" }));
    expect(
      await screen.findByRole("heading", { name: "Profile" }),
    ).toBeTruthy();

    fireEvent.change(screen.getByLabelText("Difficulty"), {
      target: { value: "normal" },
    });
    fireEvent.click(screen.getByRole("link", { name: "Play" }));

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Word list" })).toBeNull();
    });
  });

  it("shows hint button in easy and normal, but hides it in hard and insane", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({
        name: "Player",
        score: 0,
        streak: 0,
        difficulty: "normal",
      }),
    );

    renderApp();

    expect(screen.getByRole("button", { name: "Hint" })).toBeTruthy();

    fireEvent.click(screen.getByRole("link", { name: "Profile" }));
    expect(
      await screen.findByRole("heading", { name: "Profile" }),
    ).toBeTruthy();

    fireEvent.change(screen.getByLabelText("Difficulty"), {
      target: { value: "hard" },
    });
    fireEvent.click(screen.getByRole("link", { name: "Play" }));

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Hint" })).toBeNull();
    });

    fireEvent.click(screen.getByRole("link", { name: "Profile" }));
    expect(
      await screen.findByRole("heading", { name: "Profile" }),
    ).toBeTruthy();

    fireEvent.change(screen.getByLabelText("Difficulty"), {
      target: { value: "insane" },
    });
    fireEvent.click(screen.getByRole("link", { name: "Play" }));

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Hint" })).toBeNull();
    });

    fireEvent.click(screen.getByRole("link", { name: "Profile" }));
    expect(
      await screen.findByRole("heading", { name: "Profile" }),
    ).toBeTruthy();

    fireEvent.change(screen.getByLabelText("Difficulty"), {
      target: { value: "easy" },
    });
    fireEvent.click(screen.getByRole("link", { name: "Play" }));

    expect(await screen.findByRole("button", { name: "Hint" })).toBeTruthy();
  });

  it("does not show a timer in hard difficulty", () => {
    localStorage.setItem(
      "player",
      JSON.stringify({
        name: "Player",
        score: 0,
        streak: 0,
        difficulty: "hard",
      }),
    );

    renderApp();

    expect(screen.queryByLabelText(/Insane timer:/)).toBeNull();
  });

  it("uses two green hints in easy mode and then disables the hint button", () => {
    localStorage.setItem(
      "player",
      JSON.stringify({
        name: "Player",
        score: 0,
        streak: 0,
        difficulty: "easy",
      }),
    );

    renderApp();

    const hintButton = screen.getByRole("button", { name: "Hint" });
    expect((hintButton as HTMLButtonElement).disabled).toBe(false);

    fireEvent.click(hintButton);
    expect(screen.getByRole("gridcell", { name: "A, correct" })).toBeTruthy();

    fireEvent.click(hintButton);
    expect(screen.getByRole("gridcell", { name: "P, correct" })).toBeTruthy();
    expect((hintButton as HTMLButtonElement).disabled).toBe(true);
  });

  it("uses one yellow hint in normal mode and resets hints on new board", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({
        name: "Player",
        score: 0,
        streak: 0,
        difficulty: "normal",
      }),
    );

    renderApp();

    const hintButton = screen.getByRole("button", { name: "Hint" });
    fireEvent.click(hintButton);

    expect(screen.getByRole("gridcell", { name: "P, present" })).toBeTruthy();
    expect((hintButton as HTMLButtonElement).disabled).toBe(true);
    expect(localStorage.getItem(HINT_USAGE_STORAGE_KEY)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
    fireEvent.click(
      await screen.findByRole("button", { name: "Yes, refresh game" }),
    );

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "Refresh current game?" }),
      ).toBeNull();
    });

    await waitFor(() => {
      expect(
        (screen.getByRole("button", { name: "Hint" }) as HTMLButtonElement)
          .disabled,
      ).toBe(false);
    });
    expect(localStorage.getItem(HINT_USAGE_STORAGE_KEY)).toBeNull();
  });

  it("uses current letters to choose a non-repeated present hint when possible", () => {
    localStorage.setItem(
      "player",
      JSON.stringify({
        name: "Player",
        score: 0,
        streak: 0,
        difficulty: "normal",
      }),
    );

    renderApp();

    fireEvent.click(screen.getByRole("button", { name: "Letter A" }));
    fireEvent.click(screen.getByRole("button", { name: "Hint" }));

    expect(screen.getByRole("gridcell", { name: "L, present" })).toBeTruthy();
  });

  it("keeps hints used disabled state after page refresh", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({
        name: "Player",
        score: 0,
        streak: 0,
        difficulty: "normal",
      }),
    );
    sessionStorage.setItem("wordle:session-id", "session-hint-refresh");
    localStorage.setItem(
      env.wordleGameStorageKey,
      JSON.stringify({
        sessionId: "session-hint-refresh",
        answer: "APPLE",
        guesses: [
          {
            word: "BRICK",
            statuses: ["absent", "absent", "absent", "absent", "absent"],
          },
        ],
        current: "",
        gameOver: false,
      }),
    );

    renderApp();

    const hintButton = await screen.findByRole("button", { name: "Hint" });
    fireEvent.click(hintButton);
    expect((hintButton as HTMLButtonElement).disabled).toBe(true);
    expect(localStorage.getItem(HINT_USAGE_STORAGE_KEY)).toBeTruthy();

    cleanup();
    renderApp();

    await waitFor(() => {
      expect(
        (screen.getByRole("button", { name: "Hint" }) as HTMLButtonElement)
          .disabled,
      ).toBe(true);
    });
  });

  it("keeps hint consumed after reload before first submitted row", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({
        name: "Player",
        score: 0,
        streak: 0,
        difficulty: "normal",
      }),
    );
    sessionStorage.setItem("wordle:session-id", "session-hint-first-row");
    localStorage.removeItem(env.wordleGameStorageKey);
    localStorage.removeItem(HINT_USAGE_STORAGE_KEY);

    renderApp();

    const hintButton = await screen.findByRole("button", { name: "Hint" });
    fireEvent.click(hintButton);
    expect((hintButton as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByRole("gridcell", { name: "P, present" })).toBeTruthy();

    cleanup();
    renderApp();

    await waitFor(() => {
      expect(
        (screen.getByRole("button", { name: "Hint" }) as HTMLButtonElement)
          .disabled,
      ).toBe(true);
    });
    expect(screen.getByRole("gridcell", { name: "P, typing" })).toBeTruthy();
  });

  it("shares consumed hint across tabs even with different session ids", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({
        name: "Player",
        score: 0,
        streak: 0,
        difficulty: "normal",
      }),
    );
    sessionStorage.setItem("wordle:session-id", "session-hint-a");
    localStorage.setItem(
      env.wordleGameStorageKey,
      JSON.stringify({
        sessionId: "session-hint-a",
        answer: "APPLE",
        guesses: [
          {
            word: "BRICK",
            statuses: ["absent", "absent", "absent", "absent", "absent"],
          },
        ],
        current: "",
        gameOver: false,
      }),
    );
    localStorage.removeItem(HINT_USAGE_STORAGE_KEY);

    renderApp();

    const firstTabHintButton = await screen.findByRole("button", {
      name: "Hint",
    });
    fireEvent.click(firstTabHintButton);
    expect((firstTabHintButton as HTMLButtonElement).disabled).toBe(true);

    cleanup();

    sessionStorage.setItem("wordle:session-id", "session-hint-b");
    localStorage.setItem(
      env.wordleGameStorageKey,
      JSON.stringify({
        sessionId: "session-hint-b",
        answer: "APPLE",
        guesses: [
          {
            word: "BRICK",
            statuses: ["absent", "absent", "absent", "absent", "absent"],
          },
        ],
        current: "",
        gameOver: false,
      }),
    );

    renderApp();

    await waitFor(() => {
      expect(
        (screen.getByRole("button", { name: "Hint" }) as HTMLButtonElement)
          .disabled,
      ).toBe(true);
    });
  });

  it("shows an insane mode timer and decreases it on each tick", async () => {
    vi.useFakeTimers();
    localStorage.setItem(
      "player",
      JSON.stringify({
        name: "Player",
        score: 0,
        streak: 0,
        difficulty: "insane",
      }),
    );

    try {
      renderApp();

      expect(screen.getByLabelText("Insane timer: 60 seconds")).toBeTruthy();

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByLabelText("Insane timer: 60 seconds")).toBeTruthy();
      fireEvent.click(screen.getByRole("button", { name: "Letter A" }));

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByLabelText("Insane timer: 59 seconds")).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });

  it("pauses and restores insane mode timer when navigating away and back", () => {
    vi.useFakeTimers();
    localStorage.setItem(
      "player",
      JSON.stringify({
        name: "Player",
        score: 0,
        streak: 0,
        difficulty: "insane",
      }),
    );
    sessionStorage.setItem("wordle:session-id", "session-insane");
    localStorage.setItem(
      env.wordleGameStorageKey,
      JSON.stringify({
        sessionId: "session-insane",
        answer: "APPLE",
        guesses: [
          {
            word: "BRICK",
            statuses: ["absent", "absent", "absent", "absent", "absent"],
          },
        ],
        current: "",
        gameOver: false,
      }),
    );

    try {
      renderApp();

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(screen.getByLabelText("Insane timer: 57 seconds")).toBeTruthy();

      fireEvent.click(screen.getByRole("link", { name: "Profile" }));
      expect(screen.getByRole("heading", { name: "Profile" })).toBeTruthy();
      expect(screen.queryByLabelText(/Insane timer:/)).toBeNull();

      act(() => {
        vi.advanceTimersByTime(10000);
      });

      fireEvent.click(screen.getByRole("link", { name: "Play" }));

      expect(screen.getByLabelText("Insane timer: 57 seconds")).toBeTruthy();

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByLabelText("Insane timer: 56 seconds")).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });

  it("shows final-stretch bar and shakes board in insane mode under 15 seconds", async () => {
    vi.useFakeTimers();
    localStorage.setItem(
      "player",
      JSON.stringify({
        name: "Player",
        score: 0,
        streak: 0,
        difficulty: "insane",
      }),
    );

    try {
      renderApp();
      fireEvent.click(screen.getByRole("button", { name: "Letter A" }));

      act(() => {
        vi.advanceTimersByTime(45000);
      });

      const countdown = screen.getByRole("progressbar", {
        name: "Insane mode countdown",
      });
      expect(countdown.getAttribute("aria-valuenow")).toBe("15");

      expect(
        screen.getByRole("grid", { name: "Wordle board" }).parentElement
          ?.className,
      ).toContain("board-shake-pulse-animation");
    } finally {
      vi.useRealTimers();
    }
  });

  it("marks timeout as a loss and keeps the board until player refreshes", async () => {
    vi.useFakeTimers();
    localStorage.setItem(
      "player",
      JSON.stringify({
        name: "Player",
        score: 0,
        streak: 0,
        difficulty: "insane",
      }),
    );

    try {
      renderApp();
      fireEvent.click(screen.getByRole("button", { name: "Letter A" }));

      act(() => {
        vi.advanceTimersByTime(60000);
      });

      expect(screen.getByText("The word was: APPLE")).toBeTruthy();
      expect(screen.queryByLabelText(/Insane timer:/)).toBeNull();

      fireEvent.click(screen.getByRole("button", { name: "Refresh" }));

      const board = screen.getByRole("grid", { name: "Wordle board" });
      expect(board.className).toContain("board-entry-animation");
      expect(board.parentElement?.className).not.toContain(
        "board-shake-pulse-animation",
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it("asks confirmation when changing difficulty with an active game and cancels cleanly", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({ name: "Player", score: 0, streak: 0 }),
    );
    localStorage.setItem(
      env.wordleGameStorageKey,
      JSON.stringify({
        sessionId: "session-active",
        answer: "APPLE",
        guesses: [
          {
            word: "BRICK",
            statuses: ["absent", "absent", "absent", "absent", "absent"],
          },
        ],
        current: "",
        gameOver: false,
      }),
    );

    renderApp();

    fireEvent.click(screen.getByRole("link", { name: "Profile" }));
    expect(
      await screen.findByRole("heading", { name: "Profile" }),
    ).toBeTruthy();

    const difficultySelect = screen.getByLabelText(
      "Difficulty",
    ) as HTMLSelectElement;
    expect(difficultySelect.value).toBe("normal");

    fireEvent.change(difficultySelect, { target: { value: "hard" } });

    expect(
      await screen.findByRole("dialog", { name: "Change difficulty?" }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "Change difficulty?" }),
      ).toBeNull();
    });

    expect(difficultySelect.value).toBe("normal");

    await waitFor(() => {
      const player = JSON.parse(localStorage.getItem("player") || "{}");
      expect(player.difficulty).toBe("normal");
    });
    expect(localStorage.getItem(env.wordleGameStorageKey)).toBeTruthy();
  });

  it("asks confirmation when changing difficulty with typed letters before submit", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({ name: "Player", score: 0, streak: 0 }),
    );
    localStorage.setItem(
      env.wordleGameStorageKey,
      JSON.stringify({
        sessionId: "session-active",
        answer: "APPLE",
        guesses: [],
        current: "AP",
        gameOver: false,
      }),
    );

    renderApp();

    fireEvent.click(screen.getByRole("link", { name: "Profile" }));
    expect(
      await screen.findByRole("heading", { name: "Profile" }),
    ).toBeTruthy();

    const difficultySelect = screen.getByLabelText(
      "Difficulty",
    ) as HTMLSelectElement;
    expect(difficultySelect.value).toBe("normal");

    fireEvent.change(difficultySelect, { target: { value: "hard" } });

    expect(
      await screen.findByRole("dialog", { name: "Change difficulty?" }),
    ).toBeTruthy();
  });

  it("resets active game after confirming difficulty change", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({ name: "Player", score: 0, streak: 0 }),
    );
    localStorage.setItem(
      env.wordleGameStorageKey,
      JSON.stringify({
        sessionId: "session-active",
        answer: "APPLE",
        guesses: [
          {
            word: "BRICK",
            statuses: ["absent", "absent", "absent", "absent", "absent"],
          },
        ],
        current: "",
        gameOver: false,
      }),
    );

    renderApp();

    fireEvent.click(screen.getByRole("link", { name: "Profile" }));
    expect(
      await screen.findByRole("heading", { name: "Profile" }),
    ).toBeTruthy();

    const difficultySelect = screen.getByLabelText(
      "Difficulty",
    ) as HTMLSelectElement;
    expect(difficultySelect.value).toBe("normal");

    fireEvent.change(difficultySelect, { target: { value: "hard" } });

    expect(
      await screen.findByRole("dialog", { name: "Change difficulty?" }),
    ).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Yes, change and restart" }),
    );

    await waitFor(() => {
      const player = JSON.parse(localStorage.getItem("player") || "{}");
      expect(player.difficulty).toBe("hard");
    });
    expect(localStorage.getItem(env.wordleGameStorageKey)).toBeNull();
  });

  it("does not type on the board while writing the initial player name", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({ name: "Player", score: 0, streak: 0 }),
    );
    renderApp();

    const nameInput = await screen.findByLabelText("Player nick name");
    fireEvent.keyDown(nameInput, { key: "A" });

    expect(screen.queryByRole("gridcell", { name: "A, typing" })).toBeNull();
  });

  it("removes focus from refresh button when typing with physical keyboard", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({ name: "Player", score: 0, streak: 0 }),
    );

    renderApp();

    const refreshButton = screen.getByRole("button", { name: "Refresh" });
    refreshButton.focus();
    expect(document.activeElement).toBe(refreshButton);

    fireEvent.keyDown(window, { key: "A" });

    expect(document.activeElement).not.toBe(refreshButton);
    expect(screen.getByRole("gridcell", { name: "A, typing" })).toBeTruthy();
  });

  it("shows the scoreboard navbar button in red when current player is first", async () => {
    localStorage.setItem(
      "wordle:scoreboard:cache",
      JSON.stringify([
        {
          localId: "me",
          nick: "Sito",
          score: 999,
          createdAt: 1,
        },
      ]),
    );

    renderApp();

    const scoreboardLink = screen.getByRole("link", { name: "Scoreboard" });

    await waitFor(() => {
      expect(scoreboardLink.textContent).toContain("#1");
      expect(scoreboardLink.className).toContain("text-red-700");
    });
  });

  it("shows the scoreboard navbar button in green when current player is in the top 10", async () => {
    localStorage.setItem(
      "wordle:scoreboard:cache",
      JSON.stringify([
        {
          localId: "other",
          clientId: "other-client",
          nick: "Alpha",
          score: 100,
          createdAt: 1,
        },
        {
          localId: "me",
          nick: "Sito",
          score: 99,
          createdAt: 2,
        },
      ]),
    );

    renderApp();

    const scoreboardLink = screen.getByRole("link", { name: "Scoreboard" });

    await waitFor(() => {
      expect(scoreboardLink.textContent).toContain("#2");
      expect(scoreboardLink.className).toContain("text-emerald-700");
    });
  });

  it("shows the scoreboard navbar button in gray when current player is outside the top 10", async () => {
    localStorage.setItem(
      "wordle:scoreboard:cache",
      JSON.stringify([
        {
          localId: "p1",
          clientId: "other-1",
          nick: "A",
          score: 120,
          createdAt: 1,
        },
        {
          localId: "p2",
          clientId: "other-2",
          nick: "B",
          score: 119,
          createdAt: 2,
        },
        {
          localId: "p3",
          clientId: "other-3",
          nick: "C",
          score: 118,
          createdAt: 3,
        },
        {
          localId: "p4",
          clientId: "other-4",
          nick: "D",
          score: 117,
          createdAt: 4,
        },
        {
          localId: "p5",
          clientId: "other-5",
          nick: "E",
          score: 116,
          createdAt: 5,
        },
        {
          localId: "p6",
          clientId: "other-6",
          nick: "F",
          score: 115,
          createdAt: 6,
        },
        {
          localId: "p7",
          clientId: "other-7",
          nick: "G",
          score: 114,
          createdAt: 7,
        },
        {
          localId: "p8",
          clientId: "other-8",
          nick: "H",
          score: 113,
          createdAt: 8,
        },
        {
          localId: "p9",
          clientId: "other-9",
          nick: "I",
          score: 112,
          createdAt: 9,
        },
        {
          localId: "p10",
          clientId: "other-10",
          nick: "J",
          score: 111,
          createdAt: 10,
        },
        {
          localId: "p11",
          clientId: "other-11",
          nick: "K",
          score: 110,
          createdAt: 11,
        },
        {
          localId: "me",
          nick: "Sito",
          score: 1,
          createdAt: 12,
        },
      ]),
    );

    renderApp();

    const scoreboardLink = screen.getByRole("link", { name: "Scoreboard" });

    await waitFor(() => {
      expect(scoreboardLink.textContent).toContain("#12");
      expect(scoreboardLink.className).toContain("text-neutral-600");
    });
  });

  it("shows and increments win streak in home after a victory", async () => {
    renderApp();

    expect(screen.getByLabelText("Streak: 0")).toBeTruthy();

    for (const letter of ["A", "P", "P", "L", "E"]) {
      fireEvent.click(screen.getByRole("button", { name: `Letter ${letter}` }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Submit guess" }));

    expect(await screen.findByText("You got it in 1!")).toBeTruthy();
    expect(screen.getByLabelText("Streak: 1")).toBeTruthy();

    await waitFor(() => {
      const player = JSON.parse(localStorage.getItem("player") || "{}");
      expect(player.streak).toBe(1);
    });
  });

  it("opens the help dialog from home and shows rules and scoring", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({
        name: "Player",
        score: 0,
        streak: 0,
        difficulty: "normal",
      }),
    );

    renderApp();

    fireEvent.click(screen.getByRole("button", { name: "Help" }));

    expect(
      await screen.findByRole("dialog", { name: "How to play" }),
    ).toBeTruthy();
    expect(
      screen.getByText("Guess the hidden 5-letter word in up to 6 attempts."),
    ).toBeTruthy();
    expect(screen.getByText("Press Enter to submit your guess.")).toBeTruthy();
    expect(
      screen.getByText("Easy, Normal, and Hard accept non-dictionary words."),
    ).toBeTruthy();
    expect(
      screen.getByText("Insane only accepts words from the dictionary."),
    ).toBeTruthy();
    expect(
      screen.getByText(
        "Streak bonus adds your current streak value to each win.",
      ),
    ).toBeTruthy();
    expect(
      screen.getByText(
        "Final score = base points + difficulty bonus + streak bonus.",
      ),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "How to play" })).toBeNull();
    });
  });

  it("applies easy difficulty bonus and current streak bonus on win", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({
        name: "Player",
        score: 0,
        streak: 0,
        difficulty: "easy",
      }),
    );

    renderApp();

    for (const letter of ["A", "P", "P", "L", "E"]) {
      fireEvent.click(screen.getByRole("button", { name: `Letter ${letter}` }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Submit guess" }));

    await waitFor(() => {
      const player = JSON.parse(localStorage.getItem("player") || "{}");
      expect(player.score).toBe(7);
    });
  });

  it("applies hard difficulty bonus and current streak bonus on win", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({
        name: "Player",
        score: 0,
        streak: 0,
        difficulty: "hard",
      }),
    );

    renderApp();

    for (const letter of ["A", "P", "P", "L", "E"]) {
      fireEvent.click(screen.getByRole("button", { name: `Letter ${letter}` }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Submit guess" }));

    await waitFor(() => {
      const player = JSON.parse(localStorage.getItem("player") || "{}");
      expect(player.score).toBe(9);
    });
  });

  it("applies insane difficulty bonus and current streak bonus on win", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({
        name: "Player",
        score: 0,
        streak: 0,
        difficulty: "insane",
      }),
    );

    renderApp();

    for (const letter of ["A", "P", "P", "L", "E"]) {
      fireEvent.click(screen.getByRole("button", { name: `Letter ${letter}` }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Submit guess" }));

    await waitFor(() => {
      const player = JSON.parse(localStorage.getItem("player") || "{}");
      expect(player.score).toBe(10);
    });
  });

  it("uses current streak as bonus on win", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({
        name: "Player",
        score: 0,
        streak: 3,
        difficulty: "easy",
      }),
    );

    renderApp();

    for (const letter of ["A", "P", "P", "L", "E"]) {
      fireEvent.click(screen.getByRole("button", { name: `Letter ${letter}` }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Submit guess" }));

    await waitFor(() => {
      const player = JSON.parse(localStorage.getItem("player") || "{}");
      expect(player.score).toBe(10);
      expect(player.streak).toBe(4);
    });
  });

  it("resets win streak when the last persisted game is a loss", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({ name: "Player", score: 20, streak: 4 }),
    );
    localStorage.setItem(
      env.wordleGameStorageKey,
      JSON.stringify({
        sessionId: "session-lost",
        answer: "APPLE",
        guesses: [
          {
            word: "BRICK",
            statuses: ["absent", "absent", "absent", "absent", "absent"],
          },
        ],
        current: "",
        gameOver: true,
      }),
    );

    renderApp();

    await waitFor(() => {
      const player = JSON.parse(localStorage.getItem("player") || "{}");
      expect(player.streak).toBe(0);
    });
  });

  it("shows a validation message when submitting fewer than 5 letters", async () => {
    renderApp();

    fireEvent.click(screen.getByRole("button", { name: "Submit guess" }));

    const status = await screen.findByRole("status");
    expect(status.textContent).toBe("Not enough letters");
  });

  it("accepts unknown words in easy difficulty and counts the attempt", async () => {
    localStorage.setItem("wordle:dictionary:en", JSON.stringify(["apple"]));
    localStorage.setItem(
      "player",
      JSON.stringify({
        name: "Player",
        score: 0,
        streak: 0,
        difficulty: "easy",
      }),
    );

    renderApp();

    for (const letter of ["Z", "Z", "Z", "Z", "Z"]) {
      fireEvent.click(screen.getByRole("button", { name: `Letter ${letter}` }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Submit guess" }));

    await waitFor(() => {
      expect(
        screen.getAllByRole("gridcell", { name: "Z, absent" }).length,
      ).toBe(5);
    });
  });

  it("accepts unknown words in normal difficulty and counts the attempt", async () => {
    localStorage.setItem("wordle:dictionary:en", JSON.stringify(["apple"]));
    localStorage.setItem(
      "player",
      JSON.stringify({
        name: "Player",
        score: 0,
        streak: 0,
        difficulty: "normal",
      }),
    );

    renderApp();

    for (const letter of ["Z", "Z", "Z", "Z", "Z"]) {
      fireEvent.click(screen.getByRole("button", { name: `Letter ${letter}` }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Submit guess" }));

    await waitFor(() => {
      expect(
        screen.getAllByRole("gridcell", { name: "Z, absent" }).length,
      ).toBe(5);
    });
  });

  it("accepts unknown words in hard difficulty and counts the attempt", async () => {
    localStorage.setItem("wordle:dictionary:en", JSON.stringify(["apple"]));
    localStorage.setItem(
      "player",
      JSON.stringify({
        name: "Player",
        score: 0,
        streak: 0,
        difficulty: "hard",
      }),
    );

    renderApp();

    for (const letter of ["Z", "Z", "Z", "Z", "Z"]) {
      fireEvent.click(screen.getByRole("button", { name: `Letter ${letter}` }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Submit guess" }));

    await waitFor(() => {
      expect(
        screen.getAllByRole("gridcell", { name: "Z, absent" }).length,
      ).toBe(5);
    });
  });

  it("rejects unknown words in insane difficulty", async () => {
    localStorage.setItem("wordle:dictionary:en", JSON.stringify(["apple"]));
    localStorage.setItem(
      "player",
      JSON.stringify({
        name: "Player",
        score: 0,
        streak: 0,
        difficulty: "insane",
      }),
    );

    renderApp();

    for (const letter of ["Z", "Z", "Z", "Z", "Z"]) {
      fireEvent.click(screen.getByRole("button", { name: `Letter ${letter}` }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Submit guess" }));

    expect(await screen.findByText("Not in word list")).toBeTruthy();
    expect(screen.queryByRole("gridcell", { name: "Z, absent" })).toBeNull();
  });

  it("finishes a winning round and allows refreshing the board", async () => {
    renderApp();

    for (const letter of ["A", "P", "P", "L", "E"]) {
      fireEvent.click(screen.getByRole("button", { name: `Letter ${letter}` }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Submit guess" }));

    expect(await screen.findByText("You got it in 1!")).toBeTruthy();

    await waitFor(() => {
      const player = JSON.parse(localStorage.getItem("player") || "{}");
      expect(player.score).toBe(8);
    });

    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
    expect(
      screen.queryByRole("dialog", { name: "Refresh current game?" }),
    ).toBeNull();

    await waitFor(() => {
      expect(screen.queryByText("You got it in 1!")).toBeNull();
    });
    expect(screen.getByRole("button", { name: "Refresh" })).toBeTruthy();
  });

  it("asks confirmation before refreshing an active game", async () => {
    renderApp();

    fireEvent.click(screen.getByRole("button", { name: "Letter A" }));
    expect(screen.getByRole("gridcell", { name: "A, typing" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));

    expect(
      await screen.findByRole("dialog", { name: "Refresh current game?" }),
    ).toBeTruthy();
    expect(
      screen.getByText(
        "You have an active board. If you refresh now, your current progress and streak will be lost.",
      ),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "Refresh current game?" }),
      ).toBeNull();
    });
    expect(screen.getByRole("gridcell", { name: "A, typing" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
    fireEvent.click(screen.getByRole("button", { name: "Yes, refresh game" }));

    await waitFor(() => {
      expect(screen.queryByRole("gridcell", { name: "A, typing" })).toBeNull();
    });
  });

  it("highlights the current player row in the scoreboard", async () => {
    renderApp();

    for (const letter of ["A", "P", "P", "L", "E"]) {
      fireEvent.click(screen.getByRole("button", { name: `Letter ${letter}` }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Submit guess" }));

    await waitFor(() => {
      const player = JSON.parse(localStorage.getItem("player") || "{}");
      expect(player.score).toBe(8);
    });

    fireEvent.click(screen.getByRole("link", { name: "Scoreboard" }));
    expect(
      await screen.findByRole("heading", { name: "Scoreboard" }),
    ).toBeTruthy();

    await waitFor(() => {
      expect(
        document.querySelector(".scoreboard-current-player-row"),
      ).toBeTruthy();
    });
  });

  it("shows the current player as #11 when outside top 10 and displays real rank", async () => {
    const clientId = "client-me";
    localStorage.setItem("wordle:scoreboard:client-id", clientId);
    localStorage.setItem(
      "wordle:scoreboard:cache",
      JSON.stringify([
        { localId: "p1", clientId: "c1", nick: "A", score: 110, createdAt: 1 },
        { localId: "p2", clientId: "c2", nick: "B", score: 109, createdAt: 2 },
        { localId: "p3", clientId: "c3", nick: "C", score: 108, createdAt: 3 },
        { localId: "p4", clientId: "c4", nick: "D", score: 107, createdAt: 4 },
        { localId: "p5", clientId: "c5", nick: "E", score: 106, createdAt: 5 },
        { localId: "p6", clientId: "c6", nick: "F", score: 105, createdAt: 6 },
        { localId: "p7", clientId: "c7", nick: "G", score: 104, createdAt: 7 },
        { localId: "p8", clientId: "c8", nick: "H", score: 103, createdAt: 8 },
        { localId: "p9", clientId: "c9", nick: "I", score: 102, createdAt: 9 },
        {
          localId: "p10",
          clientId: "c10",
          nick: "J",
          score: 101,
          createdAt: 10,
        },
        {
          localId: "p11",
          clientId: "c11",
          nick: "K",
          score: 100,
          createdAt: 11,
        },
        {
          localId: "me",
          clientId,
          nick: "Sito",
          score: 1,
          createdAt: 12,
        },
      ]),
    );

    renderApp();

    fireEvent.click(screen.getByRole("link", { name: "Scoreboard" }));
    expect(
      await screen.findByRole("heading", { name: "Scoreboard" }),
    ).toBeTruthy();

    expect(
      await screen.findByText("You are shown as #11. Real position: #12."),
    ).toBeTruthy();
    await waitFor(() => {
      expect(
        document.querySelector(".scoreboard-current-player-row"),
      ).toBeTruthy();
    });
  });

  it("renders a fire streak badge for each visible scoreboard row", async () => {
    localStorage.setItem(
      "wordle:scoreboard:cache",
      JSON.stringify([
        {
          localId: "p1",
          clientId: "c1",
          nick: "Ana",
          score: 20,
          streak: 4,
          createdAt: 1,
        },
        {
          localId: "p2",
          clientId: "c2",
          nick: "Luis",
          score: 19,
          streak: 2,
          createdAt: 2,
        },
      ]),
    );

    renderApp();

    fireEvent.click(screen.getByRole("link", { name: "Scoreboard" }));
    expect(
      await screen.findByRole("heading", { name: "Scoreboard" }),
    ).toBeTruthy();

    expect(await screen.findByLabelText("4")).toBeTruthy();
    expect(await screen.findByLabelText("2")).toBeTruthy();
  });

  it("lets the user edit the profile name", async () => {
    renderApp();

    fireEvent.click(screen.getByRole("link", { name: "Profile" }));
    expect(
      await screen.findByRole("heading", { name: "Profile" }),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("Name:"), {
      target: { value: "Ana" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      const nameInput = screen.getByLabelText("Name:") as HTMLInputElement;
      expect(nameInput.value).toBe("Ana");
    });

    await waitFor(() => {
      const player = JSON.parse(localStorage.getItem("player") || "{}");
      expect(player.name).toBe("Ana");
    });
  });

  it("normalizes and saves profile name", async () => {
    renderApp();

    fireEvent.click(screen.getByRole("link", { name: "Profile" }));
    expect(
      await screen.findByRole("heading", { name: "Profile" }),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("Name:"), {
      target: { value: "   Ana   " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      const player = JSON.parse(localStorage.getItem("player") || "{}");
      expect(player.name).toBe("Ana");
    });
  });

  it("prevents saving an empty profile name", async () => {
    renderApp();

    fireEvent.click(screen.getByRole("link", { name: "Profile" }));
    expect(
      await screen.findByRole("heading", { name: "Profile" }),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("Name:"), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText("Name cannot be empty.")).toBeTruthy();

    const nameInput = screen.getByLabelText("Name:") as HTMLInputElement;
    expect(nameInput.value).toBe("   ");
  });

  it("prevents saving a duplicated profile name", async () => {
    localStorage.setItem(
      "wordle:scoreboard:cache",
      JSON.stringify([
        {
          localId: "other-player",
          clientId: "other-client",
          nick: "Ana",
          score: 20,
          streak: 3,
          createdAt: 1000,
        },
      ]),
    );

    renderApp();

    fireEvent.click(screen.getByRole("link", { name: "Profile" }));
    expect(
      await screen.findByRole("heading", { name: "Profile" }),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("Name:"), {
      target: { value: "Ana" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Name is not available.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeTruthy();

    const player = JSON.parse(localStorage.getItem("player") || "{}");
    expect(player.name).toBe("Player");
  });

  it("lets the user toggle start animations from profile", async () => {
    renderApp();

    fireEvent.click(screen.getByRole("link", { name: "Profile" }));
    expect(
      await screen.findByRole("heading", { name: "Profile" }),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Anim: on" }));

    expect(screen.getByRole("button", { name: "Anim: off" })).toBeTruthy();
    expect(localStorage.getItem(WORDLE_ANIMATIONS_DISABLED_STORAGE_KEY)).toBe(
      "true",
    );
    expect(
      document.documentElement.classList.contains("wordle-animations-disabled"),
    ).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Anim: off" }));

    expect(screen.getByRole("button", { name: "Anim: on" })).toBeTruthy();
    expect(localStorage.getItem(WORDLE_ANIMATIONS_DISABLED_STORAGE_KEY)).toBe(
      "false",
    );
    expect(
      document.documentElement.classList.contains("wordle-animations-disabled"),
    ).toBe(false);
  });

  it("animates the keyboard only once per tab session", async () => {
    renderApp();

    const firstKeyboard = await screen.findByRole("group", {
      name: "On-screen keyboard",
    });
    expect(firstKeyboard.className).toContain("keyboard-entry-animation");
    expect(
      sessionStorage.getItem(WORDLE_KEYBOARD_ENTRY_ANIMATION_SESSION_KEY),
    ).toBe("seen");

    fireEvent.click(screen.getByRole("link", { name: "Profile" }));
    fireEvent.click(screen.getByRole("link", { name: "Play" }));

    const secondKeyboard = await screen.findByRole("group", {
      name: "On-screen keyboard",
    });
    expect(secondKeyboard.className).not.toContain("keyboard-entry-animation");
  });

  it("replays tile entry animation on refresh even when keyboard animation is disabled", async () => {
    sessionStorage.setItem(WORDLE_KEYBOARD_ENTRY_ANIMATION_SESSION_KEY, "seen");
    sessionStorage.setItem(WORDLE_START_ANIMATION_SESSION_KEY, "seen");

    renderApp();

    const keyboard = await screen.findByRole("group", {
      name: "On-screen keyboard",
    });
    expect(keyboard.className).not.toContain("keyboard-entry-animation");
    expect(screen.getAllByRole("gridcell")[0].className).not.toContain(
      "tile-entry-animation",
    );

    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));

    await waitFor(() => {
      expect(screen.getAllByRole("gridcell")[0].className).toContain(
        "tile-entry-animation",
      );
    });
    const cells = screen.getAllByRole("gridcell");
    const stagger = Number.parseInt(cells[1].style.animationDelay, 10);
    expect(cells[29].style.animationDelay).toBe(`${29 * stagger}ms`);
  });

  it("restores the current game after reload", async () => {
    sessionStorage.setItem("wordle:session-id", "session-a");
    localStorage.setItem(
      env.wordleGameStorageKey,
      JSON.stringify({
        sessionId: "session-a",
        answer: "APPLE",
        guesses: [
          {
            word: "BRICK",
            statuses: ["absent", "absent", "absent", "absent", "absent"],
          },
        ],
        current: "AP",
        gameOver: false,
      }),
    );

    renderApp();

    expect(
      screen.getByRole("grid", { name: "Wordle board" }).className,
    ).not.toContain("board-entry-animation");
    expect(screen.getByRole("gridcell", { name: "B, absent" })).toBeTruthy();
    expect(screen.getByRole("gridcell", { name: "A, typing" })).toBeTruthy();
    expect(screen.getByRole("gridcell", { name: "P, typing" })).toBeTruthy();
  });

  it("restores typed letters after reload before first submitted row", async () => {
    sessionStorage.setItem("wordle:session-id", "session-a");
    localStorage.setItem(
      env.wordleGameStorageKey,
      JSON.stringify({
        sessionId: "session-a",
        answer: "APPLE",
        guesses: [],
        current: "AP",
        gameOver: false,
      }),
    );

    renderApp();

    expect(screen.getByRole("gridcell", { name: "A, typing" })).toBeTruthy();
    expect(screen.getByRole("gridcell", { name: "P, typing" })).toBeTruthy();
  });

  it("asks to continue if a saved board belongs to another tab session", async () => {
    sessionStorage.setItem("wordle:session-id", "session-b");
    localStorage.setItem(
      env.wordleGameStorageKey,
      JSON.stringify({
        sessionId: "session-a",
        answer: "APPLE",
        guesses: [
          {
            word: "BRICK",
            statuses: ["absent", "absent", "absent", "absent", "absent"],
          },
        ],
        current: "AP",
        gameOver: false,
      }),
    );

    renderApp();

    expect(
      screen.getByRole("dialog", { name: "Resume previous game?" }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Start new game" }));

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "Resume previous game?" }),
      ).toBeNull();
    });
  });

  it("clears consumed hints when starting a new game from resume dialog", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({
        name: "Player",
        score: 0,
        streak: 0,
        difficulty: "normal",
      }),
    );
    sessionStorage.setItem("wordle:session-id", "session-b");
    localStorage.setItem(
      env.wordleGameStorageKey,
      JSON.stringify({
        sessionId: "session-a",
        answer: "APPLE",
        guesses: [
          {
            word: "BRICK",
            statuses: ["absent", "absent", "absent", "absent", "absent"],
          },
        ],
        current: "",
        gameOver: false,
      }),
    );
    localStorage.setItem(
      HINT_USAGE_STORAGE_KEY,
      JSON.stringify({
        answer: "APPLE",
        hintsUsed: 1,
      }),
    );

    renderApp();

    expect(
      screen.getByRole("dialog", { name: "Resume previous game?" }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Start new game" }));

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "Resume previous game?" }),
      ).toBeNull();
    });

    expect(localStorage.getItem(HINT_USAGE_STORAGE_KEY)).toBeNull();
    expect(
      (screen.getByRole("button", { name: "Hint" }) as HTMLButtonElement)
        .disabled,
    ).toBe(false);
  });

  it("asks to continue when there are typed letters from another tab session", async () => {
    sessionStorage.setItem("wordle:session-id", "session-b");
    localStorage.setItem(
      env.wordleGameStorageKey,
      JSON.stringify({
        sessionId: "session-a",
        answer: "APPLE",
        guesses: [],
        current: "AP",
        gameOver: false,
      }),
    );

    renderApp();

    expect(
      screen.getByRole("dialog", { name: "Resume previous game?" }),
    ).toBeTruthy();
  });

  it("does not ask to continue when there is no in-progress board", async () => {
    sessionStorage.setItem("wordle:session-id", "session-b");
    localStorage.setItem(
      env.wordleGameStorageKey,
      JSON.stringify({
        sessionId: "session-a",
        answer: "APPLE",
        guesses: [],
        current: "",
        gameOver: false,
      }),
    );

    renderApp();

    expect(
      screen.queryByRole("dialog", { name: "Resume previous game?" }),
    ).toBeNull();
  });
});
