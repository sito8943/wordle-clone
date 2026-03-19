import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import DefeatDialog from "./DefeatDialog";

afterEach(cleanup);

describe("DefeatDialog", () => {
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
    fireEvent.click(screen.getByRole("button", { name: "Change difficulty" }));

    expect(onPlayAgain).toHaveBeenCalledTimes(1);
    expect(onChangeDifficulty).toHaveBeenCalledTimes(1);
  });
});
