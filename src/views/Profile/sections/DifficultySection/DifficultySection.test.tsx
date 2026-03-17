import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import DifficultySection from "./DifficultySection";

describe("DifficultySection", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders keyboard and difficulty options and triggers callbacks", () => {
    const onChangeKeyboardPreference = vi.fn();
    const onChangeDifficulty = vi.fn();

    render(
      <DifficultySection
        keyboardPreference="onscreen"
        onChangeKeyboardPreference={onChangeKeyboardPreference}
        difficulty="normal"
        onChangeDifficulty={onChangeDifficulty}
      />,
    );

    const keyboardMode = screen.getByLabelText(
      "Keyboard mode",
    ) as HTMLSelectElement;
    const difficultyMode = screen.getByLabelText(
      "Difficulty",
    ) as HTMLSelectElement;

    expect(keyboardMode.value).toBe("onscreen");
    expect(difficultyMode.value).toBe("normal");
    expect(screen.getByText("Easy shows the word list.")).toBeTruthy();
    expect(screen.getByText("Insane enables the timer.")).toBeTruthy();

    fireEvent.change(keyboardMode, { target: { value: "native" } });
    fireEvent.change(difficultyMode, { target: { value: "hard" } });

    expect(onChangeKeyboardPreference).toHaveBeenCalledWith("native");
    expect(onChangeDifficulty).toHaveBeenCalledWith("hard");
  });
});
