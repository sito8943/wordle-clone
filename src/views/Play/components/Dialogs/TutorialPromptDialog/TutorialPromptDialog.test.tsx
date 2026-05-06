import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TutorialPromptDialog from "./TutorialPromptDialog";

vi.mock("@i18n", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string>) => {
      const dictionary: Record<string, string> = {
        "play.tutorialPromptDialog.title": "Welcome to {{gameMode}}",
        "play.tutorialPromptDialog.description":
          "We can guide you with a quick tour of the most important controls.",
        "play.tutorialPromptDialog.confirm": "Yes, start tutorial",
        "play.tutorialPromptDialog.cancel": "No, skip tutorial",
      };

      const template = dictionary[key] ?? key;

      if (!options) return template;

      return Object.entries(options).reduce(
        (acc, [name, value]) => acc.replace(`{{${name}}}`, value),
        template,
      );
    },
  }),
}));

afterEach(cleanup);

describe("TutorialPromptDialog", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the tutorial confirmation copy", () => {
    render(
      <TutorialPromptDialog
        visible
        onClose={() => undefined}
        onConfirm={() => undefined}
        gameMode="Classic"
      />,
    );

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText("Welcome to Classic")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Yes, start tutorial" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "No, skip tutorial" }),
    ).toBeTruthy();
  });

  it("calls onConfirm when accepting", () => {
    const onConfirm = vi.fn();
    render(
      <TutorialPromptDialog
        visible
        onClose={() => undefined}
        onConfirm={onConfirm}
        gameMode="Classic"
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Yes, start tutorial" }),
    );
    act(() => {
      vi.runAllTimers();
    });

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when declining", () => {
    const onClose = vi.fn();
    render(
      <TutorialPromptDialog
        visible
        onClose={onClose}
        onConfirm={() => undefined}
        gameMode="Classic"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "No, skip tutorial" }));
    act(() => {
      vi.runAllTimers();
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
