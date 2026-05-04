import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ScoreClient } from "@api/score";
import { env } from "@config";
import { getChangelogRoute } from "@config/routes";
import { ApiProvider, FeatureFlagsProvider, PlayerProvider } from "@providers";
import { renderWithQueryClient } from "../../test/utils";
import Profile from "./Profile";

const renderProfile = () =>
  renderWithQueryClient(
    <MemoryRouter>
      <FeatureFlagsProvider>
        <ApiProvider>
          <PlayerProvider>
            <Profile />
          </PlayerProvider>
        </ApiProvider>
      </FeatureFlagsProvider>
    </MemoryRouter>,
  );

describe("Profile integration", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
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
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
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

    expect(await screen.findByRole("button", { name: "Edit" })).toBeTruthy();

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

  it("keeps bottom safe spacing to avoid footer overlap", async () => {
    renderProfile();

    const main = await screen.findByRole("main");
    expect(main.className).toContain(
      "pb-[calc(env(safe-area-inset-bottom)+6rem)]",
    );
  });

  it("renders app version as a changelog link", async () => {
    renderProfile();

    const versionLink = await screen.findByRole("link", {
      name: env.appVersion,
    });
    expect(versionLink.getAttribute("href")).toBe(
      getChangelogRoute(env.appVersion),
    );
  });

  it("recovers a profile from the profile view using a recovery code", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({
        name: "Local",
        code: "",
        score: 5,
        streak: 1,
        difficulty: "normal",
        keyboardPreference: "onscreen",
      }),
    );
    vi.spyOn(ScoreClient.prototype, "recoverPlayerByCode").mockResolvedValue({
      id: "remote-player",
      clientId: "test-client",
      clientRecordId: "test-record",
      nick: "Recovered",
      language: "en",
      playerCode: "ZX90",
      score: 44,
      streak: 6,
      difficulty: "hard",
      keyboardPreference: "native",
      createdAt: 1000,
    });

    renderProfile();

    fireEvent.change(screen.getByLabelText("Recovery code"), {
      target: { value: "zx90" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Load settings" }));

    await waitFor(() => {
      const storedPlayer = JSON.parse(localStorage.getItem("player") || "{}");
      expect(storedPlayer.name).toBe("Recovered");
      expect(storedPlayer.code).toBe("ZX90");
      expect(storedPlayer.score).toBe(44);
    });
  });
});
