import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@i18n", () => {
  const dictionary: Record<string, string> = {
    "profile.difficultyChange.title": "Change difficulty?",
    "profile.difficultyChange.description":
      "You have an active game. If you change the difficulty, your current progress will be lost.",
    "profile.difficultyChange.nextDifficulty": "New difficulty: {{difficulty}}.",
    "profile.difficultyChange.confirm": "Yes, change and restart",
    "profile.difficultyChange.cancel": "Cancel",
    "profile.difficultyOptions.easy": "Easy",
    "profile.difficultyOptions.normal": "Normal",
    "profile.difficultyOptions.hard": "Hard",
    "profile.difficultyOptions.insane": "Insane",
  };

  const translate = (
    key: string,
    options?: Record<string, string | number>,
  ) => {
    const template = dictionary[key] ?? key;
    if (!options) return template;
    return Object.entries(options).reduce(
      (acc, [name, value]) => acc.replace(`{{${name}}}`, String(value)),
      template,
    );
  };

  return {
    i18n: { t: translate },
    useTranslation: () => ({ t: translate }),
  };
});

import { i18n } from "@i18n";
import type { ProfileViewContextValue } from "@views/Profile/providers/types";
import DifficultyChangeDialog from "./DifficultyChangeDialog";

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
      streak: 0,
      language: "en",
      difficulty: "normal",
      keyboardPreference: "onscreen",
      showEndOfGameDialogs: true,
      manualTileSelection: false,
      hackingBan: null,
    },
    difficulty: "normal",
    pendingDifficulty: "hard",
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
});

describe("DifficultyChangeDialog", () => {
  afterEach(() => {
    cleanup();
  });

  it("does not render when not visible", () => {
    mockProfileView = buildMockProfileView();

    render(<DifficultyChangeDialog />);

    expect(
      screen.queryByRole("dialog", {
        name: i18n.t("profile.difficultyChange.title"),
      }),
    ).toBe(null);
  });

  it("renders pending difficulty and confirms change", async () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    mockProfileView = buildMockProfileView({
      isDifficultyChangeConfirmationOpen: true,
      cancelDifficultyChange: onClose,
      confirmDifficultyChange: onConfirm,
    });

    render(<DifficultyChangeDialog />);

    expect(
      screen.getByText(
        i18n.t("profile.difficultyChange.nextDifficulty", {
          difficulty: i18n.t("profile.difficultyOptions.hard"),
        }),
        { exact: false },
      ),
    ).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", {
        name: i18n.t("profile.difficultyChange.confirm"),
      }),
    );

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
    expect(onClose).not.toHaveBeenCalled();
  });
});
