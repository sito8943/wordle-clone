import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import VictoryDialog from "./VictoryDialog";

afterEach(cleanup);

describe("VictoryDialog", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("renders the score summary and play again action", () => {
    const onPlayAgain = vi.fn();

    render(
      <VictoryDialog
        visible
        answer="APPLE"
        currentStreak={3}
        scoreSummary={{
          items: [
            { key: "base", value: 4 },
            { key: "difficulty", value: 4.4 },
            { key: "streak", value: 1.42 },
            { key: "time", value: 5 },
          ],
          total: 15,
        }}
        onClose={() => undefined}
        onPlayAgain={onPlayAgain}
      />,
    );

    expect(screen.getByRole("dialog", { name: "Victory" })).toBeTruthy();
    expect(screen.getByText("APPLE")).toBeTruthy();
    expect(screen.getByText("Difficulty multiplier")).toBeTruthy();
    expect(screen.getByText("x4.40")).toBeTruthy();
    expect(screen.getByText("Streak multiplier")).toBeTruthy();
    expect(screen.getByText("x1.42")).toBeTruthy();
    expect(screen.getByText("Time bonus")).toBeTruthy();
    expect(screen.getByText("+15")).toBeTruthy();
    expect(screen.getByLabelText("Streak: 3")).toBeTruthy();
    expect(document.querySelector(".streak-fire")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Play again" }));
    act(() => {
      vi.runAllTimers();
    });

    expect(onPlayAgain).toHaveBeenCalledTimes(1);
  });

  it("triggers play again when pressing Enter", () => {
    const onPlayAgain = vi.fn();

    render(
      <VictoryDialog
        visible
        answer="APPLE"
        currentStreak={3}
        scoreSummary={{
          items: [{ key: "base", value: 4 }],
          total: 4,
        }}
        onClose={() => undefined}
        onPlayAgain={onPlayAgain}
      />,
    );

    fireEvent.keyDown(document, { key: "Enter" });
    act(() => {
      vi.runAllTimers();
    });

    expect(onPlayAgain).toHaveBeenCalledTimes(1);
  });

  it("shows the settings hint when requested", () => {
    render(
      <VictoryDialog
        visible
        answer="APPLE"
        currentStreak={3}
        scoreSummary={{
          items: [{ key: "base", value: 4 }],
          total: 4,
        }}
        showSettingsHint
        onClose={() => undefined}
        onPlayAgain={() => undefined}
      />,
    );

    const settingsLink = screen.getByRole("link", { name: "Settings" });

    expect(settingsLink.closest("p")?.textContent).toContain(
      "You can disable these dialogs in",
    );
    expect(settingsLink.getAttribute("href")).toBe("/settings#end-dialogs");
  });
});
