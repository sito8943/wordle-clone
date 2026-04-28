import { useEffect, useState } from "react";
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

  it("keeps tick animation when parent updates millis every second", () => {
    const ParentDrivenCountdownBadge = () => {
      const [millisUntilTarget, setMillisUntilTarget] = useState(10_000);

      useEffect(() => {
        const interval = window.setInterval(() => {
          setMillisUntilTarget((previousMillisUntilTarget) =>
            Math.max(0, previousMillisUntilTarget - 1_000),
          );
        }, 1_000);

        return () => window.clearInterval(interval);
      }, []);

      return <CountdownBadge millisUntilTarget={millisUntilTarget} />;
    };

    const { container } = render(<ParentDrivenCountdownBadge />);
    const clockIconSelector = 'svg[data-icon="clock"]';

    act(() => {
      vi.advanceTimersByTime(1_000);
    });

    expect(
      container.querySelector(clockIconSelector)?.getAttribute("class"),
    ).toContain("text-primary");
  });
});
