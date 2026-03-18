import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useNativeKeyboardInput } from "./useNativeKeyboardInput";

const TestHarness = ({
  enabled = true,
  blocked = false,
  onKey = vi.fn(),
}: {
  enabled?: boolean;
  blocked?: boolean;
  onKey?: (key: string) => void;
}) => {
  const {
    nativeKeyboardInputRef,
    handleNativeKeyboardInput,
    handleNativeKeyboardKeyDown,
  } = useNativeKeyboardInput({
    enabled,
    blocked,
    onKey,
  });

  return (
    <input
      aria-label="Native keyboard input"
      ref={nativeKeyboardInputRef}
      onInput={handleNativeKeyboardInput}
      onKeyDown={handleNativeKeyboardKeyDown}
    />
  );
};

describe("useNativeKeyboardInput", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("focuses the hidden input automatically when enabled", () => {
    render(<TestHarness />);

    act(() => {
      vi.runAllTimers();
    });

    expect(document.activeElement).toBe(
      screen.getByLabelText("Native keyboard input"),
    );
  });

  it("maps keyboard events to Wordle keys", () => {
    const onKey = vi.fn();
    render(<TestHarness onKey={onKey} />);

    fireEvent.keyDown(screen.getByLabelText("Native keyboard input"), {
      key: "a",
    });
    fireEvent.keyDown(screen.getByLabelText("Native keyboard input"), {
      key: "Enter",
    });
    fireEvent.keyDown(screen.getByLabelText("Native keyboard input"), {
      key: "Backspace",
    });
    fireEvent.keyDown(screen.getByLabelText("Native keyboard input"), {
      key: "a",
      ctrlKey: true,
    });

    expect(onKey).toHaveBeenNthCalledWith(1, "A");
    expect(onKey).toHaveBeenNthCalledWith(2, "ENTER");
    expect(onKey).toHaveBeenNthCalledWith(3, "BACKSPACE");
    expect(onKey).toHaveBeenCalledTimes(3);
  });

  it("extracts typed letters from input events", () => {
    const onKey = vi.fn();
    render(<TestHarness onKey={onKey} />);
    const input = screen.getByLabelText("Native keyboard input");

    fireEvent.change(input, { target: { value: "a1b!" } });
    fireEvent.input(input);

    expect(onKey).toHaveBeenNthCalledWith(1, "A");
    expect(onKey).toHaveBeenNthCalledWith(2, "B");
  });

  it("ignores input while blocked", () => {
    const onKey = vi.fn();
    render(<TestHarness blocked onKey={onKey} />);
    const input = screen.getByLabelText("Native keyboard input");

    fireEvent.keyDown(input, { key: "a" });
    fireEvent.change(input, { target: { value: "ab" } });
    fireEvent.input(input);

    expect(onKey).not.toHaveBeenCalled();
  });
});
