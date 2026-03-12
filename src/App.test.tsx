import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { env } from "./config";
import {
  WORDLE_ANIMATIONS_DISABLED_STORAGE_KEY,
  WORDLE_KEYBOARD_ENTRY_ANIMATION_SESSION_KEY,
} from "./domain/wordle";
import { ApiProvider, PlayerProvider } from "./providers";

vi.mock("./utils/words", async () => {
  const actual =
    await vi.importActual<typeof import("./utils/words")>("./utils/words");

  return {
    ...actual,
    getRandomWord: () => "APPLE",
  };
});

const renderApp = () =>
  render(
    <ApiProvider>
      <PlayerProvider>
        <App />
      </PlayerProvider>
    </ApiProvider>,
  );

describe("App", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    window.history.pushState({}, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
  });

  it("renders the main navigation", async () => {
    renderApp();

    expect(await screen.findByRole("heading", { name: "WORDLE" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Home" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Profile" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Scoreboard" })).toBeTruthy();
    expect(screen.getByText("#--")).toBeTruthy();
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

    expect(screen.getByLabelText("Racha: 0")).toBeTruthy();

    for (const letter of ["A", "P", "P", "L", "E"]) {
      fireEvent.click(screen.getByRole("button", { name: `Letter ${letter}` }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Submit guess" }));

    expect(await screen.findByText("You got it in 1!")).toBeTruthy();
    expect(screen.getByLabelText("Racha: 1")).toBeTruthy();

    await waitFor(() => {
      const player = JSON.parse(localStorage.getItem("player") || "{}");
      expect(player.streak).toBe(1);
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

    expect(screen.getByLabelText("Racha: 0")).toBeTruthy();

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

  it("finishes a winning round and allows refreshing the board", async () => {
    renderApp();

    for (const letter of ["A", "P", "P", "L", "E"]) {
      fireEvent.click(screen.getByRole("button", { name: `Letter ${letter}` }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Submit guess" }));

    expect(await screen.findByText("You got it in 1!")).toBeTruthy();

    await waitFor(() => {
      const player = JSON.parse(localStorage.getItem("player") || "{}");
      expect(player.score).toBe(6);
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
      expect(player.score).toBe(6);
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
    expect(await screen.findByText("#11")).toBeTruthy();
    expect(await screen.findByText("Real #12")).toBeTruthy();
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

    expect(await screen.findByLabelText("Racha: 4")).toBeTruthy();
    expect(await screen.findByLabelText("Racha: 2")).toBeTruthy();
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

    const nameInput = screen.getByLabelText("Name:") as HTMLInputElement;
    expect(nameInput.value).toBe("Ana");

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

    fireEvent.click(screen.getByRole("button", { name: "Anim: off" }));

    expect(screen.getByRole("button", { name: "Anim: on" })).toBeTruthy();
    expect(localStorage.getItem(WORDLE_ANIMATIONS_DISABLED_STORAGE_KEY)).toBe(
      "false",
    );
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
    fireEvent.click(screen.getByRole("link", { name: "Home" }));

    const secondKeyboard = await screen.findByRole("group", {
      name: "On-screen keyboard",
    });
    expect(secondKeyboard.className).not.toContain("keyboard-entry-animation");
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

  it("does not ask to continue when no row has been attempted", async () => {
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
      screen.queryByRole("dialog", { name: "Resume previous game?" }),
    ).toBeNull();
    expect(screen.queryByRole("gridcell", { name: "A, typing" })).toBeNull();
    expect(screen.queryByRole("gridcell", { name: "P, typing" })).toBeNull();
  });
});
