import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { env } from "@config";
import { ApiProvider, PlayerProvider } from "@providers";
import { renderWithQueryClient } from "../../test/utils";
import Profile from "./Profile";

const renderProfile = () =>
  renderWithQueryClient(
    <ApiProvider>
      <PlayerProvider>
        <Profile />
      </PlayerProvider>
    </ApiProvider>,
  );

describe("Profile integration", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("edits profile name and confirms difficulty change with active game", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({
        name: "Player",
        score: 14,
        streak: 2,
        difficulty: "normal",
        keyboardPreference: "onscreen",
      }),
    );
    localStorage.setItem(
      env.wordleGameStorageKey,
      JSON.stringify({
        sessionId: "profile-difficulty-session",
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

    renderProfile();

    expect(
      await screen.findByRole("heading", { name: "Profile" }),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("Name:"), {
      target: { value: "Ana" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      const storedPlayer = JSON.parse(localStorage.getItem("player") || "{}");
      expect(storedPlayer.name).toBe("Ana");
    });

    fireEvent.change(screen.getByLabelText("Difficulty"), {
      target: { value: "hard" },
    });

    expect(
      await screen.findByRole("dialog", { name: "Change difficulty?" }),
    ).toBeTruthy();
    expect(
      screen.getByText("New difficulty: Hard.", { exact: false }),
    ).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: "Yes, change and restart" }),
    );

    await waitFor(() => {
      const storedPlayer = JSON.parse(localStorage.getItem("player") || "{}");
      expect(storedPlayer.difficulty).toBe("hard");
      expect(localStorage.getItem(env.wordleGameStorageKey)).toBeNull();
    });
  });
});
