import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Player } from "@domain/wordle";
import DeveloperConsoleDialog from "./DeveloperConsoleDialog";

vi.mock("@i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const dictionary: Record<string, string> = {
        "play.developerConsole.title": "Developer console",
        "play.developerConsole.description":
          "Update current player values for local development.",
        "play.developerConsole.currentAnswerLabel": "Current answer",
        "play.developerConsole.nameLabel": "Player name",
        "play.developerConsole.difficultyLabel": "Difficulty",
        "play.developerConsole.keyboardModeLabel": "Keyboard mode",
        "play.developerConsole.checksumDescription":
          "Recompute checksum from current Convex words.",
        "play.developerConsole.refreshChecksum": "Refresh remote checksum",
        "play.developerConsole.refreshing": "Refreshing...",
        "play.developerConsole.challengesDescription":
          "Developer tools for daily challenges.",
        "play.developerConsole.refreshChallenges": "Refresh today's challenges",
        "play.developerConsole.changeChallenges": "Change today's challenges",
        "play.developerConsole.challengesRefreshing":
          "Refreshing challenges...",
        "play.developerConsole.challengesChanging": "Changing challenges...",
        "play.developerConsole.dailyDescription":
          "Developer tools for daily mode.",
        "play.developerConsole.resetDailyForCurrentPlayer":
          "Reset daily for current player",
        "play.developerConsole.resetDailyForAllPlayers":
          "Reset daily for all local players",
        "play.developerConsole.apply": "Apply",
        "play.developerConsole.cancel": "Cancel",
        "common.score": "Score",
        "common.streak": "Streak",
        "profile.difficultyOptions.easy": "Easy",
        "profile.difficultyOptions.normal": "Normal",
        "profile.difficultyOptions.hard": "Hard",
        "profile.difficultyOptions.insane": "Insane",
        "profile.keyboardOptions.onscreen": "On-screen keyboard",
        "profile.keyboardOptions.native": "Device keyboard (mobile)",
      };

      return dictionary[key] ?? key;
    },
  }),
}));

afterEach(cleanup);

const basePlayer: Player = {
  name: "Player",
  code: "",
  score: 0,
  streak: 0,
  language: "en",
  difficulty: "normal",
  keyboardPreference: "onscreen",
  showEndOfGameDialogs: true,
  manualTileSelection: false,
  hackingBan: null,
};

const createBaseProps = (player: Player) => ({
  onClose: () => undefined,
  developerConsoleEnabled: true,
  answer: "APPLE",
  player,
  showResumeDialog: false,
  showChallengesSection: true,
  showDailySection: false,
  submitDeveloperPlayer: () => undefined,
  refreshRemoteDictionaryChecksum: async () => undefined,
  isRefreshingDictionaryChecksum: false,
  dictionaryChecksumMessage: null,
  dictionaryChecksumMessageKind: null as "success" | "error" | null,
  refreshDailyChallengesForDeveloper: async () => undefined,
  changeDailyChallengesForDeveloper: async () => undefined,
  isRefreshingDailyChallengesForDeveloper: false,
  isChangingDailyChallengesForDeveloper: false,
  dailyChallengesDeveloperMessage: null,
  dailyChallengesDeveloperMessageKind: null as "success" | "error" | null,
  resetDailyForCurrentPlayerForDeveloper: () => undefined,
  resetDailyForAllPlayersForDeveloper: () => undefined,
  dailyModeDeveloperMessage: null,
  dailyModeDeveloperMessageKind: null as "success" | "error" | null,
});

const renderDialog = (player: Player, visible = true) =>
  render(
    <DeveloperConsoleDialog visible={visible} {...createBaseProps(player)} />,
  );

describe("DeveloperConsoleDialog", () => {
  it("keeps in-progress edits when player prop changes while open", () => {
    const { rerender } = renderDialog(basePlayer);

    fireEvent.change(screen.getByLabelText("Player name"), {
      target: { value: "DevUser" },
    });

    rerender(
      <DeveloperConsoleDialog
        visible
        {...createBaseProps({
          ...basePlayer,
          difficulty: "hard",
          keyboardPreference: "native",
        })}
      />,
    );

    expect(
      (screen.getByLabelText("Player name") as HTMLInputElement).value,
    ).toBe("DevUser");
  });

  it("refreshes form values from player when dialog opens again", () => {
    const { rerender } = renderDialog(basePlayer);

    fireEvent.change(screen.getByLabelText("Player name"), {
      target: { value: "DevUser" },
    });

    rerender(
      <DeveloperConsoleDialog
        visible={false}
        {...createBaseProps(basePlayer)}
      />,
    );

    rerender(
      <DeveloperConsoleDialog
        visible
        {...createBaseProps({ ...basePlayer, name: "RemoteUser" })}
      />,
    );

    expect(
      (screen.getByLabelText("Player name") as HTMLInputElement).value,
    ).toBe("RemoteUser");
  });

  it("submits updated values after clicking apply", () => {
    vi.useFakeTimers();
    const submitDeveloperPlayer = vi.fn();

    try {
      render(
        <DeveloperConsoleDialog
          visible
          {...createBaseProps(basePlayer)}
          submitDeveloperPlayer={submitDeveloperPlayer}
        />,
      );

      fireEvent.change(screen.getByLabelText("Player name"), {
        target: { value: "DevUser" },
      });
      fireEvent.change(screen.getByLabelText("Score"), {
        target: { value: "42" },
      });
      fireEvent.change(screen.getByLabelText("Streak"), {
        target: { value: "7" },
      });

      fireEvent.click(screen.getByRole("button", { name: "Apply" }));
      vi.runAllTimers();

      expect(submitDeveloperPlayer).toHaveBeenCalledWith({
        name: "DevUser",
        score: 42,
        streak: 7,
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it("triggers refresh daily challenges action", () => {
    const refreshDailyChallengesForDeveloper = vi
      .fn()
      .mockResolvedValue(undefined);

    render(
      <DeveloperConsoleDialog
        visible
        {...createBaseProps(basePlayer)}
        refreshDailyChallengesForDeveloper={refreshDailyChallengesForDeveloper}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Refresh today's challenges" }),
    );

    expect(refreshDailyChallengesForDeveloper).toHaveBeenCalledTimes(1);
  });

  it("triggers change daily challenges action", () => {
    const changeDailyChallengesForDeveloper = vi
      .fn()
      .mockResolvedValue(undefined);

    render(
      <DeveloperConsoleDialog
        visible
        {...createBaseProps(basePlayer)}
        changeDailyChallengesForDeveloper={changeDailyChallengesForDeveloper}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Change today's challenges" }),
    );

    expect(changeDailyChallengesForDeveloper).toHaveBeenCalledTimes(1);
  });

  it("hides daily challenges controls when the section is disabled", () => {
    render(
      <DeveloperConsoleDialog
        visible
        {...createBaseProps(basePlayer)}
        showChallengesSection={false}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Refresh today's challenges" }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Change today's challenges" }),
    ).toBeNull();
  });

  it("triggers reset-daily actions when daily section is enabled", () => {
    const resetDailyForCurrentPlayerForDeveloper = vi.fn();
    const resetDailyForAllPlayersForDeveloper = vi.fn();

    render(
      <DeveloperConsoleDialog
        visible
        {...createBaseProps(basePlayer)}
        showDailySection
        resetDailyForCurrentPlayerForDeveloper={
          resetDailyForCurrentPlayerForDeveloper
        }
        resetDailyForAllPlayersForDeveloper={
          resetDailyForAllPlayersForDeveloper
        }
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Reset daily for current player",
      }),
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "Reset daily for all local players",
      }),
    );

    expect(resetDailyForCurrentPlayerForDeveloper).toHaveBeenCalledTimes(1);
    expect(resetDailyForAllPlayersForDeveloper).toHaveBeenCalledTimes(1);
  });

  it("hides reset-daily controls when the daily section is disabled", () => {
    render(
      <DeveloperConsoleDialog
        visible
        {...createBaseProps(basePlayer)}
        showDailySection={false}
      />,
    );

    expect(
      screen.queryByRole("button", {
        name: "Reset daily for current player",
      }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", {
        name: "Reset daily for all local players",
      }),
    ).toBeNull();
  });
});
