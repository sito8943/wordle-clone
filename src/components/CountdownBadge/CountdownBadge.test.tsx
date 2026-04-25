import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CountdownBadge from "./CountdownBadge";

describe("CountdownBadge", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("renders countdown with label", () => {
    render(
      <CountdownBadge
        millisUntilTarget={65 * 60 * 1000}
        label="Daily reset in"
      />,
    );

    expect(screen.getByText("Daily reset in")).toBeTruthy();
    expect(screen.getByText("01h 05m 00s")).toBeTruthy();
  });

  it("updates countdown every second", () => {
    render(<CountdownBadge millisUntilTarget={65 * 60 * 1000 + 5_000} />);

    expect(screen.getByText("01h 05m 05s")).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(2_000);
    });

    expect(screen.getByText("01h 05m 03s")).toBeTruthy();
  });

  it("does not render when visible is false", () => {
    render(<CountdownBadge visible={false} millisUntilTarget={10_000} />);

    expect(screen.queryByText("00h 00m 10s")).toBeNull();
  });
});
