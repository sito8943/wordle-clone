import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Player } from "@domain/wordle";
import { i18n } from "@i18n";
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
    language: "en",
    difficulty: "normal",
    keyboardPreference: "onscreen",
    showEndOfGameDialogs: true,
    manualTileSelection: false,
    hackingBan: null,
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
      language: "en",
      keyboardPreference: "onscreen",
      changeKeyboardPreference: vi.fn(),
      isLanguageDialogOpen: false,
      pendingLanguage: "en",
      openLanguageDialog: vi.fn(),
      closeLanguageDialog: vi.fn(),
      changePendingLanguage: vi.fn(),
      saveLanguage: vi.fn(),
      showEndOfGameDialogs: true,
      changeShowEndOfGameDialogs: vi.fn(),
      soundEnabled: true,
      changeSoundEnabled: vi.fn(),
      manualTileSelection: false,
      changeManualTileSelection: vi.fn(),
      changeDifficulty: vi.fn(),
      isDifficultyChangeConfirmationOpen: false,
      confirmDifficultyChange: vi.fn(),
      cancelDifficultyChange: vi.fn(),
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
      savedMessage: i18n.t("profile.savedMessage"),
    });

    render(<ProfileEditorSection />);

    expect(screen.getByRole("status")).toBeTruthy();
    const nameInput = screen.getByLabelText(
      i18n.t("profile.labels.name"),
    ) as HTMLInputElement;
    const scoreInput = screen.getByLabelText(
      i18n.t("profile.labels.score"),
    ) as HTMLInputElement;

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

    expect(
      screen.getByRole("button", { name: i18n.t("profile.saveAction") }),
    ).toBeTruthy();
    const nameInput = screen.getByLabelText(
      i18n.t("profile.labels.name"),
    ) as HTMLInputElement;
    expect(nameInput.readOnly).toBe(false);
  });
});
