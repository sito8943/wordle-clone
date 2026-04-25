import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DailyCompletedDialog from "./DailyCompletedDialog";

afterEach(cleanup);

describe("DailyCompletedDialog", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("renders the daily completion copy and word", () => {
    render(
      <DailyCompletedDialog
        visible
        answer="GUISA"
        onClose={() => undefined}
        onGoToGameModes={() => undefined}
      />,
    );

    expect(
      screen.getByRole("dialog", { name: "Daily game completed" }),
    ).toBeTruthy();
    expect(screen.getByText("GUISA")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Go to game modes" }),
    ).toBeTruthy();
  });

  it("triggers navigation action when clicking the CTA", () => {
    const onGoToGameModes = vi.fn();

    render(
      <DailyCompletedDialog
        visible
        answer="GUISA"
        onClose={() => undefined}
        onGoToGameModes={onGoToGameModes}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Go to game modes" }));
    act(() => {
      vi.runAllTimers();
    });

    expect(onGoToGameModes).toHaveBeenCalledTimes(1);
  });

  it("triggers navigation action when pressing Enter", () => {
    const onGoToGameModes = vi.fn();

    render(
      <DailyCompletedDialog
        visible
        answer="GUISA"
        onClose={() => undefined}
        onGoToGameModes={onGoToGameModes}
      />,
    );

    fireEvent.keyDown(document, { key: "Enter" });
    act(() => {
      vi.runAllTimers();
    });

    expect(onGoToGameModes).toHaveBeenCalledTimes(1);
  });
});
