import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DifficultySection from "./DifficultySection";

vi.mock("@i18n", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string | number>) => {
      const dictionary: Record<string, string> = {
        "profile.labels.keyboard": "Keyboard",
        "profile.labels.keyboardMode": "Keyboard mode",
        "profile.labels.difficulty": "Difficulty",
        "profile.keyboardOptions.onscreen": "On-screen keyboard",
        "profile.keyboardOptions.native": "Device keyboard (mobile)",
        "profile.keyboardDescription":
          "Device keyboard is shown on mobile. Desktop keeps the on-screen keyboard.",
        "profile.difficultyOptions.easy": "Easy",
        "profile.difficultyOptions.normal": "Normal",
        "profile.difficultyOptions.hard": "Hard",
        "profile.difficultyOptions.insane": "Insane",
        "profile.difficultyRules.easy": "Easy shows the word list.",
        "profile.difficultyRules.easyNoWordList":
          "Easy gives more hints and accepts non-dictionary words.",
        "profile.difficultyRules.normal": "Normal hides the word list.",
        "profile.difficultyRules.normalNoWordList":
          "Normal gives a hint and accepts non-dictionary words.",
        "profile.difficultyRules.hard":
          "Hard disables hints and only accepts dictionary words.",
        "profile.difficultyRules.insane":
          "Insane enables a {{seconds}}-second timer and only accepts dictionary words.",
      };

      const template = dictionary[key] ?? key;

      if (!options) return template;

      return Object.entries(options).reduce(
        (acc, [name, value]) => acc.replace(`{{${name}}}`, String(value)),
        template,
      );
    },
  }),
}));

const featureFlagsMock = vi.hoisted(() => ({
  wordListButtonEnabled: true,
  difficultyEasyEnabled: true,
  difficultyNormalEnabled: true,
  difficultyHardEnabled: true,
  difficultyInsaneEnabled: true,
}));

vi.mock("@providers/FeatureFlags", () => ({
  useFeatureFlags: () => featureFlagsMock,
}));

const profileViewMock = vi.hoisted(() => ({
  controller: {
    keyboardPreference: "onscreen" as string,
    changeKeyboardPreference: vi.fn(),
    difficulty: "normal" as string,
    changeDifficulty: vi.fn(),
  },
}));

vi.mock("@views/Profile/providers", () => ({
  useProfileView: () => profileViewMock,
}));

describe("DifficultySection", () => {
  beforeEach(() => {
    featureFlagsMock.wordListButtonEnabled = true;
    featureFlagsMock.difficultyEasyEnabled = true;
    featureFlagsMock.difficultyNormalEnabled = true;
    featureFlagsMock.difficultyHardEnabled = true;
    featureFlagsMock.difficultyInsaneEnabled = true;
    profileViewMock.controller.keyboardPreference = "onscreen";
    profileViewMock.controller.difficulty = "normal";
    profileViewMock.controller.changeKeyboardPreference = vi.fn();
    profileViewMock.controller.changeDifficulty = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders keyboard and difficulty options and triggers callbacks", () => {
    render(<DifficultySection />);

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

    expect(
      profileViewMock.controller.changeKeyboardPreference,
    ).toHaveBeenCalledWith("native");
    expect(profileViewMock.controller.changeDifficulty).toHaveBeenCalledWith(
      "hard",
    );
  });

  it("shows alternative easy and normal rules when word list is disabled", () => {
    featureFlagsMock.wordListButtonEnabled = false;

    render(<DifficultySection />);

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
