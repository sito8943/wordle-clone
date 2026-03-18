import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Player } from "@domain/wordle";
import type { ProfileViewContextValue } from "@views/Profile/providers/types";
import ProfileEditorSection from "./ProfileEditorSection";

let mockProfileView: ProfileViewContextValue;

vi.mock("@views/Profile/providers", () => ({
  useProfileView: () => mockProfileView,
}));

const buildMockProfileView = (
  overrides?: Partial<ProfileViewContextValue["controller"]>,
): ProfileViewContextValue => {
  const player: Player = {
    name: "Player",
    code: "AB12",
    score: 14,
    streak: 0,
    difficulty: "normal",
    keyboardPreference: "onscreen",
  };

  return {
    controller: {
      player,
      difficulty: "normal",
      pendingDifficulty: "normal",
      editing: false,
      savedMessage: "",
      toggleEditing: vi.fn(),
      submitProfile: vi.fn(),
      submitRecoveryCode: vi.fn(),
      code: "AB12",
      startAnimationsEnabled: true,
      toggleStartAnimations: vi.fn(),
      themePreference: "system",
      changeThemePreference: vi.fn(),
      keyboardPreference: "onscreen",
      changeKeyboardPreference: vi.fn(),
      changeDifficulty: vi.fn(),
      isDifficultyChangeConfirmationOpen: false,
      confirmDifficultyChange: vi.fn(),
      cancelDifficultyChange: vi.fn(),
      pendingDifficultyLabel: vi.fn().mockReturnValue("Normal"),
      ...overrides,
    },
  };
};

describe("ProfileEditorSection", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders readonly profile card and success status", () => {
    mockProfileView = buildMockProfileView({
      savedMessage: "Configuration saved.",
    });

    render(<ProfileEditorSection />);

    expect(screen.getByRole("status")).toBeTruthy();
    const nameInput = screen.getByLabelText("Name:") as HTMLInputElement;
    const scoreInput = screen.getByLabelText("Score:") as HTMLInputElement;

    expect(nameInput.value).toBe("Player");
    expect(scoreInput.value).toBe("14");
    expect(nameInput.readOnly).toBe(true);
  });

  it("renders editable profile card while editing", () => {
    mockProfileView = buildMockProfileView({
      editing: true,
      submitProfile: vi.fn().mockResolvedValue(null),
    });

    render(<ProfileEditorSection />);

    expect(screen.getByRole("button", { name: "Save" })).toBeTruthy();
    const nameInput = screen.getByLabelText("Name:") as HTMLInputElement;
    expect(nameInput.readOnly).toBe(false);
  });
});
