import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ProfileViewContextValue } from "@views/Profile/providers/types";
import { i18n } from "@i18n";
import LanguageDialog from "./LanguageDialog";

let mockProfileView: ProfileViewContextValue;

vi.mock("@views/Profile/providers", () => ({
  useProfileView: () => mockProfileView,
}));

const buildMockProfileView = (
  overrides?: Partial<ProfileViewContextValue["controller"]>,
): ProfileViewContextValue => ({
  controller: {
    player: {
      name: "Player",
      code: "AB12",
      score: 14,
      streak: 1,
      language: "en",
      difficulty: "normal",
      keyboardPreference: "onscreen",
      showEndOfGameDialogs: true,
    },
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
    changeDifficulty: vi.fn(),
    isDifficultyChangeConfirmationOpen: false,
    confirmDifficultyChange: vi.fn(),
    cancelDifficultyChange: vi.fn(),
    ...overrides,
  },
});

describe("LanguageDialog", () => {
  afterEach(() => {
    cleanup();
  });

  it("does not render when closed", () => {
    mockProfileView = buildMockProfileView({
      isLanguageDialogOpen: false,
    });

    render(<LanguageDialog />);

    expect(
      screen.queryByRole("dialog", {
        name: i18n.t("profile.languageDialog.title"),
      }),
    ).toBeNull();
  });

  it("changes language and submits", () => {
    const changePendingLanguage = vi.fn();
    const saveLanguage = vi.fn();
    mockProfileView = buildMockProfileView({
      isLanguageDialogOpen: true,
      pendingLanguage: "en",
      changePendingLanguage,
      saveLanguage,
    });

    render(<LanguageDialog />);

    fireEvent.change(screen.getByLabelText(i18n.t("profile.labels.languageMode")), {
      target: { value: "es" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: i18n.t("profile.languageDialog.save") }),
    );

    expect(changePendingLanguage).toHaveBeenCalledWith("es");
    expect(saveLanguage).toHaveBeenCalledTimes(1);
  });
});
