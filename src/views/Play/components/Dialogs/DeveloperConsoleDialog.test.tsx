import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Player } from "@domain/wordle";
import DeveloperConsoleDialog from "./DeveloperConsoleDialog";

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

const renderDialog = (player: Player, visible = true) =>
  render(
    <DeveloperConsoleDialog
      visible={visible}
      onClose={() => undefined}
      developerConsoleEnabled
      answer="APPLE"
      player={player}
      showResumeDialog={false}
      submitDeveloperPlayer={() => undefined}
      refreshRemoteDictionaryChecksum={async () => undefined}
      isRefreshingDictionaryChecksum={false}
      dictionaryChecksumMessage={null}
      dictionaryChecksumMessageKind={null}
    />,
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
        onClose={() => undefined}
        developerConsoleEnabled
        answer="APPLE"
        player={{
          ...basePlayer,
          difficulty: "hard",
          keyboardPreference: "native",
        }}
        showResumeDialog={false}
        submitDeveloperPlayer={() => undefined}
        refreshRemoteDictionaryChecksum={async () => undefined}
        isRefreshingDictionaryChecksum={false}
        dictionaryChecksumMessage={null}
        dictionaryChecksumMessageKind={null}
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
        onClose={() => undefined}
        developerConsoleEnabled
        answer="APPLE"
        player={basePlayer}
        showResumeDialog={false}
        submitDeveloperPlayer={() => undefined}
        refreshRemoteDictionaryChecksum={async () => undefined}
        isRefreshingDictionaryChecksum={false}
        dictionaryChecksumMessage={null}
        dictionaryChecksumMessageKind={null}
      />,
    );

    rerender(
      <DeveloperConsoleDialog
        visible
        onClose={() => undefined}
        developerConsoleEnabled
        answer="APPLE"
        player={{ ...basePlayer, name: "RemoteUser" }}
        showResumeDialog={false}
        submitDeveloperPlayer={() => undefined}
        refreshRemoteDictionaryChecksum={async () => undefined}
        isRefreshingDictionaryChecksum={false}
        dictionaryChecksumMessage={null}
        dictionaryChecksumMessageKind={null}
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
          onClose={() => undefined}
          developerConsoleEnabled
          answer="APPLE"
          player={basePlayer}
          showResumeDialog={false}
          submitDeveloperPlayer={submitDeveloperPlayer}
          refreshRemoteDictionaryChecksum={async () => undefined}
          isRefreshingDictionaryChecksum={false}
          dictionaryChecksumMessage={null}
          dictionaryChecksumMessageKind={null}
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
      fireEvent.change(screen.getByLabelText("Difficulty"), {
        target: { value: "hard" },
      });
      fireEvent.change(screen.getByLabelText("Keyboard mode"), {
        target: { value: "native" },
      });

      fireEvent.click(screen.getByRole("button", { name: "Apply" }));
      vi.runAllTimers();

      expect(submitDeveloperPlayer).toHaveBeenCalledWith({
        name: "DevUser",
        score: 42,
        streak: 7,
        difficulty: "hard",
        keyboardPreference: "native",
      });
    } finally {
      vi.useRealTimers();
    }
  });
});
