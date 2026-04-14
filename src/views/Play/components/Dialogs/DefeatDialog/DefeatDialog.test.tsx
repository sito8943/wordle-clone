import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DefeatDialog from "./DefeatDialog";

afterEach(cleanup);

describe("DefeatDialog", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("renders the answer and both actions", () => {
    const onPlayAgain = vi.fn();
    const onChangeDifficulty = vi.fn();

    render(
      <DefeatDialog
        visible
        answer="APPLE"
        bestStreak={4}
        onClose={() => undefined}
        onPlayAgain={onPlayAgain}
        onChangeDifficulty={onChangeDifficulty}
      />,
    );

    expect(screen.getByRole("dialog", { name: "Game Over" })).toBeTruthy();
    expect(screen.getByText("APPLE")).toBeTruthy();
    expect(screen.getByText("Best streak: 4")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Play again" }));
    act(() => {
      vi.runAllTimers();
    });
    fireEvent.click(screen.getByRole("button", { name: "Change difficulty" }));
    act(() => {
      vi.runAllTimers();
    });

    expect(onPlayAgain).toHaveBeenCalledTimes(1);
    expect(onChangeDifficulty).toHaveBeenCalledTimes(1);
  });

  it("triggers play again when pressing Enter", () => {
    const onPlayAgain = vi.fn();

    render(
      <DefeatDialog
        visible
        answer="APPLE"
        bestStreak={4}
        onClose={() => undefined}
        onPlayAgain={onPlayAgain}
        onChangeDifficulty={() => undefined}
      />,
    );

    fireEvent.keyDown(document, { key: "Enter" });
    act(() => {
      vi.runAllTimers();
    });

    expect(onPlayAgain).toHaveBeenCalledTimes(1);
  });

  it("hides the settings hint when not requested", () => {
    render(
      <DefeatDialog
        visible
        answer="APPLE"
        bestStreak={4}
        onClose={() => undefined}
        onPlayAgain={() => undefined}
        onChangeDifficulty={() => undefined}
      />,
    );

    expect(screen.queryByRole("link", { name: "Settings" })).toBeNull();
  });

  it("hides change difficulty action when disabled", () => {
    render(
      <DefeatDialog
        visible
        answer="APPLE"
        bestStreak={4}
        showChangeDifficultyAction={false}
        onClose={() => undefined}
        onPlayAgain={() => undefined}
        onChangeDifficulty={() => undefined}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Change difficulty" }),
    ).toBeNull();
  });
});
