import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DifficultySection from "./DifficultySection";

const featureFlagsMock = vi.hoisted(() => ({
  wordListButtonEnabled: true,
}));

vi.mock("@providers/FeatureFlags", () => ({
  useFeatureFlags: () => featureFlagsMock,
}));

describe("DifficultySection", () => {
  beforeEach(() => {
    featureFlagsMock.wordListButtonEnabled = true;
  });

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
    expect(
      screen.getByText(
        "Insane enables a 60-second timer and only accepts dictionary words.",
      ),
    ).toBeTruthy();

    fireEvent.change(keyboardMode, { target: { value: "native" } });
    fireEvent.change(difficultyMode, { target: { value: "hard" } });

    expect(onChangeKeyboardPreference).toHaveBeenCalledWith("native");
    expect(onChangeDifficulty).toHaveBeenCalledWith("hard");
  });

  it("shows alternative easy and normal rules when word list is disabled", () => {
    featureFlagsMock.wordListButtonEnabled = false;

    render(
      <DifficultySection
        keyboardPreference="onscreen"
        onChangeKeyboardPreference={vi.fn()}
        difficulty="normal"
        onChangeDifficulty={vi.fn()}
      />,
    );

    expect(screen.queryByText("Easy shows the word list.")).toBeNull();
    expect(screen.queryByText("Normal hides the word list.")).toBeNull();
    expect(
      screen.getByText(
        "Easy gives more hints and accepts non-dictionary words.",
      ),
    ).toBeTruthy();
    expect(
      screen.getByText("Normal gives a hint and accepts non-dictionary words."),
    ).toBeTruthy();
  });
});
