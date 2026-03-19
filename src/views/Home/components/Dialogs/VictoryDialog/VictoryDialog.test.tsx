import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import VictoryDialog from "./VictoryDialog";

afterEach(cleanup);

describe("VictoryDialog", () => {
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
            { key: "difficulty", value: 4 },
            { key: "streak", value: 2 },
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
    expect(screen.getByText("Time bonus")).toBeTruthy();
    expect(screen.getByText("+15")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Play again" }));

    expect(onPlayAgain).toHaveBeenCalledTimes(1);
  });
});
