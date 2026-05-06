import {
  act,
  cleanup,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { ScoreClient, type TopScoresResult } from "@api/score";
import { UPDATE_SCORE_MUTATION } from "@api/score/constants";
import { WORDS_DEFAULT_LANGUAGE, WordDictionaryClient } from "@api/words";
import { env } from "@config";
import { ROUTES } from "@config/routes";
import {
  MAX_STREAK_FOR_SCORE_MULTIPLIER,
  WORDLE_ANIMATIONS_DISABLED_STORAGE_KEY,
  WORDLE_KEYBOARD_ENTRY_ANIMATION_SESSION_KEY,
  WORDLE_START_ANIMATION_SESSION_KEY,
} from "@domain/wordle";
import { i18n } from "@i18n";
import { THEME_PREFERENCE_STORAGE_KEY } from "@hooks/useThemePreference";
import { APP_VERSION_STORAGE_KEY } from "@layouts/View/constants";
import {
  ApiProvider,
  DialogQueueProvider,
  FeatureFlagsProvider,
  PlayerProvider,
  SoundProvider,
} from "@providers";
import {
  WORDLE_MUSIC_MAP,
  WORDLE_SOUND_EVENT_MAP,
  WORDLE_SOUND_STORAGE_KEY_PREFIX,
  WORDLE_SOUND_STORAGE_KEYS,
} from "@providers/Sound";
import { renderWithQueryClient } from "./test/utils";
import { HINT_USAGE_STORAGE_KEY } from "@views/Play/hooks/useHintController";
import {
  END_OF_GAME_DIALOG_SEEN_SESSION_STORAGE_KEY,
  TUTORIAL_PROMPT_SEEN_MODES_STORAGE_KEY,
} from "@views/Play/hooks/usePlayController/constants";
import { PLAY_BOARD_SHARE_CAPTURE_ID } from "@views/Play/constants";

vi.mock("./utils/words", async () => {
  const actual =
    await vi.importActual<typeof import("@utils/words")>("./utils/words");

  return {
    ...actual,
    getRandomWord: () => "APPLE",
  };
});

vi.mock("@providers/FeatureFlags", async () => {
  const actual = await vi.importActual<
    typeof import("@providers/FeatureFlags")
  >("@providers/FeatureFlags");

  return {
    ...actual,
    useFeatureFlags: () => ({
      ...actual.useFeatureFlags(),
      difficultyEasyEnabled: true,
      difficultyNormalEnabled: true,
      difficultyHardEnabled: true,
      difficultyInsaneEnabled: true,
    }),
  };
});

const renderApp = () =>
  renderWithQueryClient(
    <SoundProvider
      featureEnabled={env.soundEnabled}
      eventMap={WORDLE_SOUND_EVENT_MAP}
      musicMap={WORDLE_MUSIC_MAP}
      storageKeyPrefix={WORDLE_SOUND_STORAGE_KEY_PREFIX}
      storageKeys={WORDLE_SOUND_STORAGE_KEYS}
    >
      <FeatureFlagsProvider>
        <ApiProvider>
          <PlayerProvider>
            <DialogQueueProvider>
              <App />
            </DialogQueueProvider>
          </PlayerProvider>
        </ApiProvider>
      </FeatureFlagsProvider>
    </SoundProvider>,
  );

const waitForPlayReady = async () => {
  await waitFor(() => {
    expect(screen.queryByRole("status", { name: "Loading Wordle" })).toBeNull();
  });
  await screen.findByRole("grid", { name: "Wordle board" }, { timeout: 5000 });
};

const getInsaneTimerSeconds = (): number => {
  const timer = screen.getByLabelText(/Insane timer: \d+ seconds/);
  const timerLabel = timer.getAttribute("aria-label") ?? "";
  const match = /Insane timer: (\d+) seconds/.exec(timerLabel);

  if (!match) {
    throw new Error(
      `Unable to parse insane timer seconds from "${timerLabel}"`,
    );
  }

  return Number(match[1]);
};

const waitForInitialPlayerDialog = async () => {
  await waitFor(() => {
    expect(screen.queryByRole("status", { name: "Loading Wordle" })).toBeNull();
  });
  await screen.findByRole(
    "dialog",
    { name: "Welcome to Wordle" },
    {
      timeout: 5000,
    },
  );
};

const defaultEnvMode = env.mode;
const defaultEnvBackendUrl = env.backendUrl;
const defaultEnvConvexUrl = env.convexUrl;
const defaultEnvWordListButtonEnabled = env.wordListButtonEnabled;
const defaultEnvDifficultyEasyEnabled = env.difficultyEasyEnabled;
const defaultEnvDifficultyNormalEnabled = env.difficultyNormalEnabled;
const defaultEnvDifficultyHardEnabled = env.difficultyHardEnabled;
const defaultEnvDifficultyInsaneEnabled = env.difficultyInsaneEnabled;

const mockNavigatorLanguage = (language: string) => {
  Object.defineProperty(window.navigator, "language", {
    configurable: true,
    value: language,
  });
  Object.defineProperty(window.navigator, "languages", {
    configurable: true,
    value: [language],
  });
};

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

const preloadAppRoutes = async () => {
  await Promise.all([
    import("@layouts/View"),
    import("@views/Home"),
    import("@views/GameModes"),
    import("@views/Play"),
    import("@views/GameModes/Zen"),
    import("@views/GameModes/Lightning"),
    import("@views/GameModes/Daily"),
    import("@views/Changelog"),
    import("@views/Help"),
    import("@views/Scoreboard"),
    import("@views/Profile"),
    import("@views/NotFound"),
  ]);
};

describe("App", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    env.backendUrl = defaultEnvBackendUrl;
    env.wordListButtonEnabled = defaultEnvWordListButtonEnabled;
    env.difficultyEasyEnabled = defaultEnvDifficultyEasyEnabled;
    env.difficultyNormalEnabled = defaultEnvDifficultyNormalEnabled;
    env.difficultyHardEnabled = defaultEnvDifficultyHardEnabled;
    env.difficultyInsaneEnabled = defaultEnvDifficultyInsaneEnabled;
    Reflect.deleteProperty(window.navigator, "language");
    Reflect.deleteProperty(window.navigator, "languages");
    cleanup();
  });

  beforeEach(async () => {
    await preloadAppRoutes();
    mockNavigatorLanguage("en-US");
    await i18n.changeLanguage("en");
    env.mode = defaultEnvMode;
    env.backendUrl = defaultEnvBackendUrl;
    env.convexUrl = defaultEnvConvexUrl;
    env.wordListButtonEnabled = true;
    env.difficultyEasyEnabled = true;
    env.difficultyNormalEnabled = true;
    env.difficultyHardEnabled = true;
    env.difficultyInsaneEnabled = true;
    localStorage.clear();
    localStorage.setItem(APP_VERSION_STORAGE_KEY, env.appVersion);
    localStorage.setItem(
      "player",
      JSON.stringify({
        name: "TestUser",
        score: 0,
        streak: 0,
        language: "en",
        declinedTutorial: false,
      }),
    );
    sessionStorage.clear();
    sessionStorage.setItem(WORDLE_START_ANIMATION_SESSION_KEY, "seen");
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.remove("wordle-animations-disabled");
    document.documentElement.style.colorScheme = "";
    mockSystemTheme("light");
    window.history.pushState({}, "", ROUTES.CLASSIC);
    window.dispatchEvent(new PopStateEvent("popstate"));
    let mockedNow = 10_000;
    vi.spyOn(Date, "now").mockImplementation(() => {
      const current = mockedNow;
      mockedNow += 5_000;
      return current;
    });
    vi.spyOn(ScoreClient.prototype, "upsertPlayerProfile").mockImplementation(
      async (input) => ({
        id: "remote-player",
        clientId: "test-client",
        clientRecordId: "test-record",
        nick: input.nick,
        language: input.language,
        playerCode: "AB12",
        score: input.score ?? 0,
        streak: input.streak ?? 0,
        difficulty: input.difficulty,
        keyboardPreference: input.keyboardPreference,
        createdAt: 1000,
      }),
    );
    vi.spyOn(ScoreClient.prototype, "recoverPlayerByCode").mockResolvedValue({
      id: "remote-player",
      clientId: "test-client",
      clientRecordId: "test-record",
      nick: "Recovered",
      language: "en",
      playerCode: "AB12",
      score: 0,
      streak: 0,
      difficulty: "normal",
      keyboardPreference: "onscreen",
      createdAt: 1000,
    });
    vi.spyOn(
      ScoreClient.prototype,
      "getCurrentPlayerProfile",
    ).mockResolvedValue(null);
    vi.spyOn(ScoreClient.prototype, "syncRoundEvents").mockResolvedValue(null);
  });

  it("renders the main navigation", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({ name: "TestUser", score: 0, streak: 0 }),
    );
    renderApp();
    await waitForPlayReady();
    expect(screen.getByRole("link", { name: "Play" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Help" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Settings" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Scoreboard" })).toBeTruthy();
  });

  it("shows an update banner and triggers skip waiting when a new app version is ready", async () => {
    const postMessage = vi.fn();
    const registration = {
      waiting: {
        postMessage,
      },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      update: vi.fn().mockResolvedValue(undefined),
    } as unknown as ServiceWorkerRegistration;
    const serviceWorkerMock = {
      controller: {} as ServiceWorker,
      getRegistration: vi.fn().mockResolvedValue(registration),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as ServiceWorkerContainer;
    const previousServiceWorker = navigator.serviceWorker;

    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      writable: true,
      value: serviceWorkerMock,
    });

    try {
      localStorage.setItem(
        "player",
        JSON.stringify({ name: "TestUser", score: 0, streak: 0 }),
      );

      renderApp();

      expect(
        await screen.findByText(
          "A new version is available. Reload to update the app.",
        ),
      ).toBeTruthy();

      fireEvent.click(screen.getByRole("button", { name: "Reload" }));

      await waitFor(() => {
        expect(postMessage).toHaveBeenCalledWith({ type: "SKIP_WAITING" });
      });
    } finally {
      cleanup();
      Object.defineProperty(navigator, "serviceWorker", {
        configurable: true,
        writable: true,
        value: previousServiceWorker,
      });
    }
  });

  it("renders the home page at / with play, settings and scoreboard links", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({ name: "TestUser", score: 0, streak: 0 }),
    );
    window.history.pushState({}, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));

    renderApp();

    await waitFor(() => {
      expect(
        screen.queryByRole("status", { name: "Loading Wordle" }),
      ).toBeNull();
    });

    const main = await screen.findByRole("main");

    expect(within(main).getByRole("heading", { name: "WORDLE" })).toBeTruthy();
    expect(within(main).getByRole("link", { name: "Play" })).toBeTruthy();
    expect(within(main).getByRole("link", { name: "Settings" })).toBeTruthy();
    expect(within(main).getByRole("link", { name: "Scoreboard" })).toBeTruthy();
  });

  it("hides the footer on play", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({ name: "TestUser", score: 0, streak: 0 }),
    );
    window.history.pushState({}, "", ROUTES.PLAY);
    window.dispatchEvent(new PopStateEvent("popstate"));

    renderApp();

    await waitFor(() => {
      expect(
        screen.queryByRole("status", { name: "Loading Wordle" }),
      ).toBeNull();
    });

    const footer = await screen.findByRole("contentinfo");
    expect(footer.className).toContain("translate-y-full");
    expect(footer.className).not.toContain("translate-y-0");
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
      await waitForPlayReady();

      const scoreboardLink = screen.getByRole("link", { name: "Scoreboard" });
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
    await waitForInitialPlayerDialog();

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
          language: WORDS_DEFAULT_LANGUAGE,
          modeId: "classic",
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

  it("recovers a player from the initial dialog using a recovery code", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({ name: "Player", score: 0, streak: 0 }),
    );

    renderApp();

    fireEvent.click(screen.getByRole("button", { name: "Recover settings" }));
    fireEvent.change(screen.getByLabelText("Recovery code"), {
      target: { value: "ab12" },
    });
    fireEvent.click(
      screen.getAllByRole("button", { name: "Recover settings" })[1],
    );

    await waitFor(() => {
      const player = JSON.parse(localStorage.getItem("player") || "{}");
      expect(player.name).toBe("Recovered");
      expect(player.code).toBe("AB12");
    });
  });

  it("defaults to system theme preference", async () => {
    mockSystemTheme("dark");
    localStorage.setItem(
      "player",
      JSON.stringify({ name: "Player", score: 0, streak: 0 }),
    );

    renderApp();

    await waitForPlayReady();
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
    await waitForPlayReady();

    fireEvent.click(screen.getByRole("link", { name: "Settings" }));
    expect(
      await screen.findByRole("button", { name: "Edit" }, { timeout: 5000 }),
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

  it("scrolls to hash target after lazy profile content mounts", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({ name: "PlayerOne", score: 0, streak: 0 }),
    );

    const originalScrollIntoView = Element.prototype.scrollIntoView;
    const scrollIntoViewSpy = vi.fn();
    Object.defineProperty(Element.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoViewSpy,
    });

    window.history.pushState({}, "", `${ROUTES.SETTINGS}#difficulty`);
    window.dispatchEvent(new PopStateEvent("popstate"));

    try {
      renderApp();
      await screen.findByRole("button", { name: "Edit" }, { timeout: 5000 });

      await waitFor(() => {
        expect(scrollIntoViewSpy).toHaveBeenCalled();
      });
    } finally {
      Object.defineProperty(Element.prototype, "scrollIntoView", {
        configurable: true,
        value: originalScrollIntoView,
      });
    }
  });

  it("defaults to normal difficulty from profile when missing in storage", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({ name: "Player", score: 0, streak: 0 }),
    );

    renderApp();

    fireEvent.click(screen.getByRole("link", { name: "Settings" }));
    expect(await screen.findByRole("button", { name: "Edit" })).toBeTruthy();

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

    fireEvent.click(screen.getByRole("link", { name: "Settings" }));
    expect(await screen.findByRole("button", { name: "Edit" })).toBeTruthy();

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

    fireEvent.click(screen.getByRole("link", { name: "Settings" }));
    expect(await screen.findByRole("button", { name: "Edit" })).toBeTruthy();

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
      JSON.stringify({
        name: "TestUser",
        score: 0,
        streak: 0,
        declinedTutorial: false,
      }),
    );
    env.mode = "develpment";
    env.backendUrl = undefined;
    env.convexUrl = undefined;
    const recordScoreSpy = vi
      .spyOn(ScoreClient.prototype, "recordScore")
      .mockResolvedValue();

    try {
      renderApp();

      fireEvent.click(
        await screen.findByRole("button", { name: "Developer console" }),
      );

      const developerConsoleDialog = await screen.findByRole("dialog", {
        name: "Developer console",
      });
      const dialog = within(developerConsoleDialog);

      expect(developerConsoleDialog).toBeTruthy();
      expect(dialog.getByText("Current answer")).toBeTruthy();
      expect(dialog.getByText("APPLE")).toBeTruthy();

      fireEvent.change(dialog.getByLabelText("Player name"), {
        target: { value: "DevUser" },
      });
      fireEvent.change(dialog.getByLabelText("Score"), {
        target: { value: "42" },
      });
      fireEvent.change(dialog.getByLabelText("Streak"), {
        target: { value: "7" },
      });

      fireEvent.click(dialog.getByRole("button", { name: "Apply" }));

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
    } finally {
      recordScoreSpy.mockRestore();
    }
  });

  it("syncs scoreboard with score overrides from developer console", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({
        name: "TestUser",
        score: 80,
        streak: 5,
        declinedTutorial: false,
      }),
    );
    localStorage.setItem("wordle:scoreboard:client-id", "dev-client");
    localStorage.setItem(
      "wordle:scoreboard:cache",
      JSON.stringify([
        {
          localId: "dev-row",
          clientId: "dev-client",
          nick: "Player",
          language: WORDS_DEFAULT_LANGUAGE,
          modeId: "classic",
          score: 80,
          streak: 5,
          createdAt: 1000,
        },
      ]),
    );
    env.mode = "develpment";
    env.backendUrl = undefined;
    env.convexUrl = undefined;
    const recordScoreSpy = vi
      .spyOn(ScoreClient.prototype, "recordScore")
      .mockImplementation(async (input) => {
        const cache = JSON.parse(
          localStorage.getItem("wordle:scoreboard:cache") || "[]",
        ) as Array<Record<string, unknown>>;
        const targetIndex = cache.findIndex(
          (entry) => entry.clientId === "dev-client",
        );

        const nextEntry = {
          localId: "dev-row",
          clientId: "dev-client",
          nick: input.nick,
          score: input.score,
          streak: input.streak ?? 0,
          createdAt: Date.now(),
          language: input.language,
          modeId: input.modeId,
        };

        if (targetIndex >= 0) {
          cache[targetIndex] = { ...cache[targetIndex], ...nextEntry };
        } else {
          cache.push(nextEntry);
        }

        localStorage.setItem("wordle:scoreboard:cache", JSON.stringify(cache));
      });

    try {
      renderApp();

      fireEvent.click(
        await screen.findByRole("button", { name: "Developer console" }),
      );
      const developerConsoleDialog = await screen.findByRole("dialog", {
        name: "Developer console",
      });
      const dialog = within(developerConsoleDialog);

      expect(developerConsoleDialog).toBeTruthy();

      fireEvent.change(dialog.getByLabelText("Score"), {
        target: { value: "12" },
      });
      fireEvent.change(dialog.getByLabelText("Streak"), {
        target: { value: "1" },
      });
      fireEvent.click(dialog.getByRole("button", { name: "Apply" }));

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
        const cachedScores = JSON.parse(
          localStorage.getItem("wordle:scoreboard:cache") || "[]",
        ) as Array<{ clientId?: string; score?: number }>;
        expect(
          cachedScores.some(
            (entry) => entry.clientId === "dev-client" && entry.score === 12,
          ),
        ).toBe(true);
      });
    } finally {
      recordScoreSpy.mockRestore();
    }
  });

  it("refreshes remote dictionary checksum from developer console", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({
        name: "TestUser",
        score: 0,
        streak: 0,
        declinedTutorial: false,
      }),
    );
    env.mode = "develpment";
    env.backendUrl = undefined;
    env.convexUrl = undefined;
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

    fireEvent.click(screen.getByRole("link", { name: "Settings" }));
    expect(await screen.findByRole("button", { name: "Edit" })).toBeTruthy();

    fireEvent.change(screen.getByLabelText("Difficulty"), {
      target: { value: "easy" },
    });
    window.history.pushState({}, "", ROUTES.CLASSIC);
    window.dispatchEvent(new PopStateEvent("popstate"));

    expect(
      await screen.findByRole("button", { name: "Word list" }),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("link", { name: "Settings" }));
    expect(await screen.findByRole("button", { name: "Edit" })).toBeTruthy();

    fireEvent.change(screen.getByLabelText("Difficulty"), {
      target: { value: "normal" },
    });
    window.history.pushState({}, "", ROUTES.CLASSIC);
    window.dispatchEvent(new PopStateEvent("popstate"));

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

    fireEvent.click(screen.getByRole("link", { name: "Settings" }));
    expect(await screen.findByRole("button", { name: "Edit" })).toBeTruthy();

    fireEvent.change(screen.getByLabelText("Difficulty"), {
      target: { value: "hard" },
    });
    window.history.pushState({}, "", ROUTES.CLASSIC);
    window.dispatchEvent(new PopStateEvent("popstate"));

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Hint" })).toBeNull();
    });

    fireEvent.click(screen.getByRole("link", { name: "Settings" }));
    expect(await screen.findByRole("button", { name: "Edit" })).toBeTruthy();

    fireEvent.change(screen.getByLabelText("Difficulty"), {
      target: { value: "insane" },
    });
    window.history.pushState({}, "", ROUTES.CLASSIC);
    window.dispatchEvent(new PopStateEvent("popstate"));

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Hint" })).toBeNull();
    });

    fireEvent.click(screen.getByRole("link", { name: "Settings" }));
    expect(await screen.findByRole("button", { name: "Edit" })).toBeTruthy();

    fireEvent.change(screen.getByLabelText("Difficulty"), {
      target: { value: "easy" },
    });
    window.history.pushState({}, "", ROUTES.CLASSIC);
    window.dispatchEvent(new PopStateEvent("popstate"));

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
        name: "TestUser",
        score: 0,
        streak: 0,
        difficulty: "normal",
        declinedTutorial: false,
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

    const hintButton = await screen.findByRole(
      "button",
      { name: "Hint" },
      { timeout: 10_000 },
    );
    fireEvent.click(hintButton);
    expect((hintButton as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByRole("gridcell", { name: "P, present" })).toBeTruthy();

    cleanup();
    renderApp();

    await waitFor(
      () => {
        expect(
          (screen.getByRole("button", { name: "Hint" }) as HTMLButtonElement)
            .disabled,
        ).toBe(true);
      },
      { timeout: 10_000 },
    );
    expect(screen.getByRole("gridcell", { name: "P, typing" })).toBeTruthy();
  }, 15_000);

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

  it("pauses and restores insane mode timer when navigating away and back", async () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
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
      await screen.findByRole("grid", { name: "Wordle board" });

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      const secondsBeforeRouteChange = getInsaneTimerSeconds();
      expect([57, 58]).toContain(secondsBeforeRouteChange);

      fireEvent.click(screen.getByRole("link", { name: "Settings" }));
      expect(await screen.findByLabelText("Theme mode")).toBeTruthy();
      expect(screen.queryByLabelText(/Insane timer:/)).toBeNull();

      act(() => {
        vi.advanceTimersByTime(10000);
      });

      window.history.pushState({}, "", ROUTES.CLASSIC);
      window.dispatchEvent(new PopStateEvent("popstate"));

      await screen.findByLabelText(/Insane timer: \d+ seconds/);
      expect(getInsaneTimerSeconds()).toBe(secondsBeforeRouteChange);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      if (getInsaneTimerSeconds() !== secondsBeforeRouteChange - 1) {
        act(() => {
          vi.advanceTimersByTime(1000);
        });
      }

      expect(getInsaneTimerSeconds()).toBe(secondsBeforeRouteChange - 1);
    } finally {
      vi.useRealTimers();
    }
  });

  it("shows final-stretch bar and shakes board in insane mode under 15 seconds", async () => {
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
      await waitForPlayReady();
      const letterAButton = await screen.findByRole("button", {
        name: "Letter A",
      });
      vi.useFakeTimers();
      fireEvent.click(letterAButton);

      act(() => {
        vi.advanceTimersByTime(45000);
      });

      const countdown = screen.getByRole("progressbar", {
        name: "Insane mode countdown",
      });
      expect(countdown.getAttribute("aria-valuenow")).toBe("15");

      const boardWrapper = screen
        .getByRole("grid", { name: "Wordle board" })
        .closest(`#${PLAY_BOARD_SHARE_CAPTURE_ID}`);
      expect(boardWrapper?.className).toContain("board-shake-pulse-animation");
    } finally {
      vi.useRealTimers();
    }
  });

  it("marks timeout as a loss and keeps the board until player refreshes", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({
        name: "Player",
        score: 0,
        streak: 0,
        difficulty: "insane",
        showEndOfGameDialogs: false,
      }),
    );

    try {
      renderApp();
      const letterAButton = await screen.findByRole("button", {
        name: "Letter A",
      });
      vi.useFakeTimers();
      fireEvent.click(letterAButton);

      act(() => {
        vi.advanceTimersByTime(60000);
      });

      expect(screen.getByText("The word was: APPLE")).toBeTruthy();
      expect(screen.queryByLabelText(/Insane timer:/)).toBeNull();

      fireEvent.click(screen.getByRole("button", { name: "Refresh" }));

      const board = screen.getByRole("grid", { name: "Wordle board" });
      const boardWrapper = board.closest("div.mx-auto");
      expect(board.className).toContain("board-entry-animation");
      expect(boardWrapper?.className).not.toContain(
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

    fireEvent.click(screen.getByRole("link", { name: "Settings" }));
    expect(await screen.findByRole("button", { name: "Edit" })).toBeTruthy();

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

    fireEvent.click(screen.getByRole("link", { name: "Settings" }));
    expect(await screen.findByRole("button", { name: "Edit" })).toBeTruthy();

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

    fireEvent.click(screen.getByRole("link", { name: "Settings" }));
    expect(await screen.findByRole("button", { name: "Edit" })).toBeTruthy();

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
          language: WORDS_DEFAULT_LANGUAGE,
          modeId: "classic",
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
          language: WORDS_DEFAULT_LANGUAGE,
          modeId: "classic",
          score: 100,
          createdAt: 1,
        },
        {
          localId: "me",
          nick: "Sito",
          language: WORDS_DEFAULT_LANGUAGE,
          modeId: "classic",
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
          language: WORDS_DEFAULT_LANGUAGE,
          modeId: "classic",
          score: 120,
          createdAt: 1,
        },
        {
          localId: "p2",
          clientId: "other-2",
          nick: "B",
          language: WORDS_DEFAULT_LANGUAGE,
          modeId: "classic",
          score: 119,
          createdAt: 2,
        },
        {
          localId: "p3",
          clientId: "other-3",
          nick: "C",
          language: WORDS_DEFAULT_LANGUAGE,
          modeId: "classic",
          score: 118,
          createdAt: 3,
        },
        {
          localId: "p4",
          clientId: "other-4",
          nick: "D",
          language: WORDS_DEFAULT_LANGUAGE,
          modeId: "classic",
          score: 117,
          createdAt: 4,
        },
        {
          localId: "p5",
          clientId: "other-5",
          nick: "E",
          language: WORDS_DEFAULT_LANGUAGE,
          modeId: "classic",
          score: 116,
          createdAt: 5,
        },
        {
          localId: "p6",
          clientId: "other-6",
          nick: "F",
          language: WORDS_DEFAULT_LANGUAGE,
          modeId: "classic",
          score: 115,
          createdAt: 6,
        },
        {
          localId: "p7",
          clientId: "other-7",
          nick: "G",
          language: WORDS_DEFAULT_LANGUAGE,
          modeId: "classic",
          score: 114,
          createdAt: 7,
        },
        {
          localId: "p8",
          clientId: "other-8",
          nick: "H",
          language: WORDS_DEFAULT_LANGUAGE,
          modeId: "classic",
          score: 113,
          createdAt: 8,
        },
        {
          localId: "p9",
          clientId: "other-9",
          nick: "I",
          language: WORDS_DEFAULT_LANGUAGE,
          modeId: "classic",
          score: 112,
          createdAt: 9,
        },
        {
          localId: "p10",
          clientId: "other-10",
          nick: "J",
          language: WORDS_DEFAULT_LANGUAGE,
          modeId: "classic",
          score: 111,
          createdAt: 10,
        },
        {
          localId: "p11",
          clientId: "other-11",
          nick: "K",
          language: WORDS_DEFAULT_LANGUAGE,
          modeId: "classic",
          score: 110,
          createdAt: 11,
        },
        {
          localId: "me",
          nick: "Sito",
          language: WORDS_DEFAULT_LANGUAGE,
          modeId: "classic",
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

  it("shows and increments win streak in play after a victory", async () => {
    renderApp();

    expect(await screen.findByLabelText("Streak: 0")).toBeTruthy();

    for (const letter of ["A", "P", "P", "L", "E"]) {
      fireEvent.click(screen.getByRole("button", { name: `Letter ${letter}` }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Submit guess" }));

    expect(await screen.findByRole("dialog", { name: "Victory" })).toBeTruthy();
    expect(
      screen
        .getByRole("dialog", { name: "Victory" })
        .querySelector('[aria-label="Streak: 1"]'),
    ).toBeTruthy();

    await waitFor(() => {
      const player = JSON.parse(localStorage.getItem("player") || "{}");
      expect(player.streak).toBe(1);
    });
  });

  it("keeps the lightning streak in toolbar after closing the victory dialog", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({
        name: "TestUser",
        score: 88,
        streak: 3,
        language: "en",
        declinedTutorial: false,
      }),
    );
    localStorage.setItem("wordle:scoreboard:client-id", "lightning-client");
    localStorage.setItem(
      "wordle:scoreboard:cache",
      JSON.stringify([
        {
          localId: "lightning-local",
          clientId: "lightning-client",
          nick: "TestUser",
          language: WORDS_DEFAULT_LANGUAGE,
          modeId: "lightning",
          score: 110,
          streak: 3,
          createdAt: 1000,
        },
      ]),
    );
    localStorage.setItem(
      TUTORIAL_PROMPT_SEEN_MODES_STORAGE_KEY,
      JSON.stringify({ lightning: true }),
    );
    window.history.pushState({}, "", ROUTES.LIGHTING);
    window.dispatchEvent(new PopStateEvent("popstate"));

    renderApp();
    await waitForPlayReady();
    expect(screen.getByLabelText("Streak: 3")).toBeTruthy();

    for (const letter of ["A", "P", "P", "L", "E"]) {
      fireEvent.click(screen.getByRole("button", { name: `Letter ${letter}` }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Submit guess" }));

    const victoryDialog = await screen.findByRole("dialog", {
      name: "Victory",
    });
    expect(within(victoryDialog).getByLabelText("Streak: 4")).toBeTruthy();

    fireEvent.click(
      within(victoryDialog).getByRole("button", { name: "Close" }),
    );

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Victory" })).toBeNull();
    });
    expect(screen.getByLabelText("Streak: 4")).toBeTruthy();
  });

  it("shows the settings hint only on the first end-of-game dialog in a tab", async () => {
    renderApp();
    await waitForPlayReady();

    for (const letter of ["A", "P", "P", "L", "E"]) {
      fireEvent.click(screen.getByRole("button", { name: `Letter ${letter}` }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Submit guess" }));

    const victoryDialog = await screen.findByRole("dialog", {
      name: "Victory",
    });
    expect(victoryDialog).toBeTruthy();
    expect(
      within(victoryDialog)
        .getByRole("link", { name: "Settings" })
        .getAttribute("href"),
    ).toBe(`${ROUTES.SETTINGS}#end-dialogs`);
    expect(
      sessionStorage.getItem(END_OF_GAME_DIALOG_SEEN_SESSION_STORAGE_KEY),
    ).toBe("seen");
  });

  it("opens the help page from navbar and shows rules and scoring", async () => {
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
    await waitForPlayReady();

    fireEvent.click(await screen.findByRole("link", { name: "Help" }));

    expect(
      await screen.findByRole("heading", { name: "How to play" }),
    ).toBeTruthy();
    expect(
      screen.getByText("Guess the hidden 5-letter word in up to 6 attempts."),
    ).toBeTruthy();
    expect(screen.getByText("Press Enter to submit your guess.")).toBeTruthy();
    expect(
      screen.getByText("Easy and Normal accept non-dictionary words."),
    ).toBeTruthy();
    expect(
      screen.getByText(
        "Hard and Insane only accept words from the dictionary.",
      ),
    ).toBeTruthy();
    expect(
      screen.getByText(
        `Streak scales your score with x(1 + 0.3 x sqrt(min(streak, ${MAX_STREAK_FOR_SCORE_MULTIPLIER}))).`,
      ),
    ).toBeTruthy();
    expect(
      screen.getByText(
        `Final score = round(score base x (1 + 0.3 x sqrt(min(streak, ${MAX_STREAK_FOR_SCORE_MULTIPLIER})))), where score base includes the difficulty multiplier and the Insane time bonus.`,
      ),
    ).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: "difficulty settings" })
        .getAttribute("href"),
    ).toBe(`${ROUTES.SETTINGS}#difficulty`);
  });

  it("applies easy difficulty scoring on win", async () => {
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
    await waitForPlayReady();

    for (const letter of ["A", "P", "P", "L", "E"]) {
      fireEvent.click(screen.getByRole("button", { name: `Letter ${letter}` }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Submit guess" }));

    await waitFor(() => {
      const player = JSON.parse(localStorage.getItem("player") || "{}");
      expect(player.score).toBe(6);
    });
  });

  it("applies hard difficulty scoring on win", async () => {
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
    await waitForPlayReady();

    for (const letter of ["A", "P", "P", "L", "E"]) {
      fireEvent.click(screen.getByRole("button", { name: `Letter ${letter}` }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Submit guess" }));

    await waitFor(() => {
      const player = JSON.parse(localStorage.getItem("player") || "{}");
      expect(player.score).toBe(30);
    });
  });

  it("applies insane difficulty, streak, and remaining-time bonuses on win", async () => {
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
    await waitForPlayReady();

    for (const letter of ["A", "P", "P", "L", "E"]) {
      fireEvent.click(screen.getByRole("button", { name: `Letter ${letter}` }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Submit guess" }));

    await waitFor(() => {
      const player = JSON.parse(localStorage.getItem("player") || "{}");
      expect(player.score).toBe(57);
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
    await waitForPlayReady();

    for (const letter of ["A", "P", "P", "L", "E"]) {
      fireEvent.click(screen.getByRole("button", { name: `Letter ${letter}` }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Submit guess" }));

    await waitFor(() => {
      const player = JSON.parse(localStorage.getItem("player") || "{}");
      expect(player.score).toBe(9);
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
    localStorage.setItem(
      `wordle:dictionary:${WORDS_DEFAULT_LANGUAGE}`,
      JSON.stringify(["apple"]),
    );
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
    localStorage.setItem(
      `wordle:dictionary:${WORDS_DEFAULT_LANGUAGE}`,
      JSON.stringify(["apple"]),
    );
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

  it("rejects unknown words in hard difficulty", async () => {
    localStorage.setItem(
      `wordle:dictionary:${WORDS_DEFAULT_LANGUAGE}`,
      JSON.stringify(["apple"]),
    );
    localStorage.setItem(
      "player",
      JSON.stringify({
        name: "Player",
        score: 0,
        streak: 0,
        difficulty: "hard",
      }),
    );
    localStorage.setItem("wordle:current-mode", "classic");

    renderApp();

    for (const letter of ["Z", "Z", "Z", "Z", "Z"]) {
      fireEvent.click(screen.getByRole("button", { name: `Letter ${letter}` }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Submit guess" }));

    expect(await screen.findByText("Not in word list")).toBeTruthy();
    expect(screen.queryByRole("gridcell", { name: "Z, absent" })).toBeNull();
  });

  it("rejects unknown words in insane difficulty", async () => {
    localStorage.setItem(
      `wordle:dictionary:${WORDS_DEFAULT_LANGUAGE}`,
      JSON.stringify(["apple"]),
    );
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
    localStorage.setItem(
      "player",
      JSON.stringify({
        name: "Winner",
        score: 0,
        streak: 0,
        showEndOfGameDialogs: false,
      }),
    );

    renderApp();
    await waitForPlayReady();

    for (const letter of ["A", "P", "P", "L", "E"]) {
      fireEvent.click(screen.getByRole("button", { name: `Letter ${letter}` }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Submit guess" }));

    expect(await screen.findByText("You got it in 1!")).toBeTruthy();

    await waitFor(() => {
      const player = JSON.parse(localStorage.getItem("player") || "{}");
      expect(player.score).toBe(12);
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

  it("opens the victory dialog by default and starts a clean board after play again", async () => {
    renderApp();

    for (const letter of ["A", "P", "P", "L", "E"]) {
      fireEvent.click(
        await screen.findByRole("button", { name: `Letter ${letter}` }),
      );
    }
    fireEvent.click(screen.getByRole("button", { name: "Submit guess" }));

    expect(await screen.findByRole("dialog", { name: "Victory" })).toBeTruthy();
    expect(screen.getByText("APPLE")).toBeTruthy();
    expect(screen.queryByText("You got it in 1!")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Play again" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Victory" })).toBeNull();
    });
    expect(screen.queryByText("APPLE")).toBeNull();
  });

  it("reopens the victory dialog from the end-of-game message after closing it", async () => {
    renderApp();

    for (const letter of ["A", "P", "P", "L", "E"]) {
      fireEvent.click(
        await screen.findByRole("button", { name: `Letter ${letter}` }),
      );
    }
    fireEvent.click(screen.getByRole("button", { name: "Submit guess" }));

    const victoryDialog = await screen.findByRole("dialog", {
      name: "Victory",
    });
    expect(victoryDialog).toBeTruthy();

    fireEvent.click(
      within(victoryDialog).getByRole("button", { name: "Close" }),
    );

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Victory" })).toBeNull();
    });
    expect(screen.getByText("You got it in 1!")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Results" }));

    expect(await screen.findByRole("dialog", { name: "Victory" })).toBeTruthy();
    expect(screen.queryByText("You got it in 1!")).toBeNull();
  });

  it("asks confirmation before refreshing an active game", async () => {
    renderApp();
    window.history.pushState({}, "", ROUTES.CLASSIC);
    window.dispatchEvent(new PopStateEvent("popstate"));
    await screen.findByRole("button", { name: "Letter A" });

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
    localStorage.setItem(
      "player",
      JSON.stringify({
        name: "Ana",
        code: "AB12",
        score: 0,
        streak: 0,
        difficulty: "normal",
        keyboardPreference: "onscreen",
      }),
    );
    renderApp();
    await waitForPlayReady();
    window.history.pushState({}, "", ROUTES.CLASSIC);
    window.dispatchEvent(new PopStateEvent("popstate"));
    await screen.findByRole("button", { name: "Letter A" });

    for (const letter of ["A", "P", "P", "L", "E"]) {
      fireEvent.click(screen.getByRole("button", { name: `Letter ${letter}` }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Submit guess" }));

    await waitFor(() => {
      const player = JSON.parse(localStorage.getItem("player") || "{}");
      expect(player.score).toBe(12);
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
        {
          localId: "p1",
          clientId: "c1",
          nick: "A",
          language: WORDS_DEFAULT_LANGUAGE,
          modeId: "classic",
          score: 110,
          createdAt: 1,
        },
        {
          localId: "p2",
          clientId: "c2",
          nick: "B",
          language: WORDS_DEFAULT_LANGUAGE,
          modeId: "classic",
          score: 109,
          createdAt: 2,
        },
        {
          localId: "p3",
          clientId: "c3",
          nick: "C",
          language: WORDS_DEFAULT_LANGUAGE,
          modeId: "classic",
          score: 108,
          createdAt: 3,
        },
        {
          localId: "p4",
          clientId: "c4",
          nick: "D",
          language: WORDS_DEFAULT_LANGUAGE,
          modeId: "classic",
          score: 107,
          createdAt: 4,
        },
        {
          localId: "p5",
          clientId: "c5",
          nick: "E",
          language: WORDS_DEFAULT_LANGUAGE,
          modeId: "classic",
          score: 106,
          createdAt: 5,
        },
        {
          localId: "p6",
          clientId: "c6",
          nick: "F",
          language: WORDS_DEFAULT_LANGUAGE,
          modeId: "classic",
          score: 105,
          createdAt: 6,
        },
        {
          localId: "p7",
          clientId: "c7",
          nick: "G",
          language: WORDS_DEFAULT_LANGUAGE,
          modeId: "classic",
          score: 104,
          createdAt: 7,
        },
        {
          localId: "p8",
          clientId: "c8",
          nick: "H",
          language: WORDS_DEFAULT_LANGUAGE,
          modeId: "classic",
          score: 103,
          createdAt: 8,
        },
        {
          localId: "p9",
          clientId: "c9",
          nick: "I",
          language: WORDS_DEFAULT_LANGUAGE,
          modeId: "classic",
          score: 102,
          createdAt: 9,
        },
        {
          localId: "p10",
          clientId: "c10",
          nick: "J",
          language: WORDS_DEFAULT_LANGUAGE,
          modeId: "classic",
          score: 101,
          createdAt: 10,
        },
        {
          localId: "p11",
          clientId: "c11",
          nick: "K",
          language: WORDS_DEFAULT_LANGUAGE,
          modeId: "classic",
          score: 100,
          createdAt: 11,
        },
        {
          localId: "me",
          clientId,
          nick: "Sito",
          language: WORDS_DEFAULT_LANGUAGE,
          modeId: "classic",
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
    env.backendUrl = undefined;
    env.convexUrl = undefined;

    localStorage.setItem(
      "wordle:scoreboard:cache",
      JSON.stringify([
        {
          localId: "p1",
          clientId: "c1",
          nick: "Ana",
          language: WORDS_DEFAULT_LANGUAGE,
          modeId: "classic",
          score: 20,
          streak: 4,
          createdAt: 1,
        },
        {
          localId: "p2",
          clientId: "c2",
          nick: "Luis",
          language: WORDS_DEFAULT_LANGUAGE,
          modeId: "classic",
          score: 19,
          streak: 2,
          createdAt: 2,
        },
      ]),
    );

    renderApp();
    await waitForPlayReady();

    fireEvent.click(screen.getByRole("link", { name: "Scoreboard" }));
    expect(
      await screen.findByRole("heading", { name: "Scoreboard" }),
    ).toBeTruthy();

    expect(await screen.findByLabelText("4")).toBeTruthy();
    expect(await screen.findByLabelText("2")).toBeTruthy();
  });

  it("lets the user edit the profile name", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({
        name: "Player",
        score: 0,
        streak: 0,
        difficulty: "normal",
        keyboardPreference: "onscreen",
      }),
    );
    renderApp();

    fireEvent.click(screen.getByRole("link", { name: "Settings" }));
    expect(await screen.findByRole("button", { name: "Edit" })).toBeTruthy();

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
    localStorage.setItem(
      "player",
      JSON.stringify({
        name: "Player",
        score: 0,
        streak: 0,
        difficulty: "normal",
        keyboardPreference: "onscreen",
      }),
    );
    renderApp();

    fireEvent.click(screen.getByRole("link", { name: "Settings" }));
    expect(await screen.findByRole("button", { name: "Edit" })).toBeTruthy();

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

    fireEvent.click(screen.getByRole("link", { name: "Settings" }));
    expect(await screen.findByRole("button", { name: "Edit" })).toBeTruthy();

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
    const initialPlayerName = JSON.parse(localStorage.getItem("player") || "{}")
      .name as string;

    localStorage.setItem(
      "wordle:scoreboard:cache",
      JSON.stringify([
        {
          localId: "other-player",
          clientId: "other-client",
          nick: "Ana",
          language: WORDS_DEFAULT_LANGUAGE,
          modeId: "classic",
          score: 20,
          streak: 3,
          createdAt: 1000,
        },
      ]),
    );

    renderApp();

    fireEvent.click(screen.getByRole("link", { name: "Settings" }));
    expect(await screen.findByRole("button", { name: "Edit" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("Name:"), {
      target: { value: "Ana" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Name is not available.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeTruthy();

    const player = JSON.parse(localStorage.getItem("player") || "{}");
    expect(player.name).toBe(initialPlayerName);
  });

  it("lets the user toggle start animations from profile", async () => {
    renderApp();

    fireEvent.click(screen.getByRole("link", { name: "Settings" }));
    expect(await screen.findByRole("button", { name: "Edit" })).toBeTruthy();

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
    window.history.pushState({}, "", ROUTES.CLASSIC);
    window.dispatchEvent(new PopStateEvent("popstate"));
    renderApp();

    const firstKeyboard = await screen.findByRole("group", {
      name: "On-screen keyboard",
    });
    expect(firstKeyboard.className).toContain("keyboard-entry-animation");
    expect(
      sessionStorage.getItem(WORDLE_KEYBOARD_ENTRY_ANIMATION_SESSION_KEY),
    ).toBe("seen");

    fireEvent.click(screen.getByRole("link", { name: "Settings" }));
    window.history.pushState({}, "", ROUTES.CLASSIC);
    window.dispatchEvent(new PopStateEvent("popstate"));

    const secondKeyboard = await screen.findByRole("group", {
      name: "On-screen keyboard",
    });
    expect(secondKeyboard.className).not.toContain("keyboard-entry-animation");
  });

  it("replays tile entry animation on refresh even when keyboard animation is disabled", async () => {
    sessionStorage.setItem(WORDLE_KEYBOARD_ENTRY_ANIMATION_SESSION_KEY, "seen");
    sessionStorage.setItem(WORDLE_START_ANIMATION_SESSION_KEY, "seen");

    renderApp();
    window.history.pushState({}, "", ROUTES.CLASSIC);
    window.dispatchEvent(new PopStateEvent("popstate"));

    const keyboard = await screen.findByRole("group", {
      name: "On-screen keyboard",
    });
    expect(keyboard.className).not.toContain("keyboard-entry-animation");
    expect(screen.getAllByRole("gridcell")[0].className).not.toContain(
      "tile-entry-animation",
    );

    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
    const refreshDialog = screen.queryByRole("dialog", {
      name: "Refresh current game?",
    });
    if (refreshDialog) {
      fireEvent.click(
        within(refreshDialog).getByRole("button", {
          name: "Yes, refresh game",
        }),
      );
    }

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
    window.history.pushState({}, "", ROUTES.CLASSIC);
    window.dispatchEvent(new PopStateEvent("popstate"));

    renderApp();
    const board = await screen.findByRole("grid", { name: "Wordle board" });

    expect(board.className).not.toContain("board-entry-animation");
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
    window.history.pushState({}, "", ROUTES.CLASSIC);
    window.dispatchEvent(new PopStateEvent("popstate"));

    renderApp();

    expect(
      await screen.findByRole("gridcell", { name: "A, typing" }),
    ).toBeTruthy();
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
    window.history.pushState({}, "", ROUTES.CLASSIC);
    window.dispatchEvent(new PopStateEvent("popstate"));

    renderApp();

    expect(
      await screen.findByRole("dialog", { name: "Resume previous game?" }),
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
        name: "TestUser",
        score: 0,
        streak: 0,
        difficulty: "normal",
        declinedTutorial: false,
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
    window.history.pushState({}, "", ROUTES.CLASSIC);
    window.dispatchEvent(new PopStateEvent("popstate"));

    renderApp();

    expect(
      await screen.findByRole("dialog", { name: "Resume previous game?" }),
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
    window.history.pushState({}, "", ROUTES.CLASSIC);
    window.dispatchEvent(new PopStateEvent("popstate"));

    renderApp();

    expect(
      await screen.findByRole("dialog", { name: "Resume previous game?" }),
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
