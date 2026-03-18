import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
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
      difficulty: "normal",
      keyboardPreference: "onscreen",
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
    keyboardPreference: "onscreen",
    changeKeyboardPreference: vi.fn(),
    changeDifficulty: vi.fn(),
    isDifficultyChangeConfirmationOpen: false,
    confirmDifficultyChange: vi.fn(),
    cancelDifficultyChange: vi.fn(),
    pendingDifficultyLabel: vi.fn().mockImplementation((difficulty) =>
      difficulty === "hard" ? "Hard" : "Normal",
    ),
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

    expect(screen.queryByRole("dialog", { name: "Change difficulty?" })).toBe(
      null,
    );
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
      screen.getByText("New difficulty: Hard.", { exact: false }),
    ).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: "Yes, change and restart" }),
    );

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
    expect(onClose).not.toHaveBeenCalled();
  });
});
