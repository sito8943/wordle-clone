import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import GameplayTourDialog from "./GameplayTourDialog";

vi.mock("@i18n", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string | number>) => {
      const dictionary: Record<string, string> = {
        "play.gameplayTour.progress": "{{current}} / {{total}}",
        "play.gameplayTour.fallbackNotice": "Fallback notice",
        "play.gameplayTour.actions.help": "Open Help",
        "play.gameplayTour.actions.skip": "Skip",
        "play.gameplayTour.actions.back": "Back",
        "play.gameplayTour.actions.next": "Next",
        "play.gameplayTour.actions.finish": "Finish",
        "tour.step.one.title": "Board",
        "tour.step.one.description": "Board description",
        "tour.step.two.title": "Keyboard",
        "tour.step.two.description": "Keyboard description",
      };

      const template = dictionary[key] ?? key;

      if (!options) {
        return template;
      }

      return Object.entries(options).reduce(
        (acc, [name, value]) => acc.replace(`{{${name}}}`, String(value)),
        template,
      );
    },
  }),
}));

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

describe("GameplayTourDialog", () => {
  it("does not render when hidden", () => {
    render(
      <GameplayTourDialog
        visible={false}
        steps={[]}
        stepIndex={0}
        canGoPrevious={false}
        onClose={() => undefined}
        onNextStep={() => undefined}
        onPreviousStep={() => undefined}
        onOpenHelp={() => undefined}
      />,
    );

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders active step and fallback notice when target is missing", () => {
    render(
      <GameplayTourDialog
        visible
        steps={[
          {
            id: "one",
            selector: "#missing",
            titleKey: "tour.step.one.title",
            descriptionKey: "tour.step.one.description",
          },
        ]}
        stepIndex={0}
        canGoPrevious={false}
        onClose={() => undefined}
        onNextStep={() => undefined}
        onPreviousStep={() => undefined}
        onOpenHelp={() => undefined}
      />,
    );

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText("Board")).toBeTruthy();
    expect(screen.getByText("Board description")).toBeTruthy();
    expect(screen.getByText("1 / 1")).toBeTruthy();
    expect(screen.getByText("Fallback notice")).toBeTruthy();
  });

  it("calls navigation callbacks", () => {
    const onClose = vi.fn();
    const onNextStep = vi.fn();
    const onPreviousStep = vi.fn();
    const onOpenHelp = vi.fn();

    const { rerender } = render(
      <GameplayTourDialog
        visible
        steps={[
          {
            id: "one",
            selector: null,
            titleKey: "tour.step.one.title",
            descriptionKey: "tour.step.one.description",
          },
          {
            id: "two",
            selector: null,
            titleKey: "tour.step.two.title",
            descriptionKey: "tour.step.two.description",
          },
        ]}
        stepIndex={0}
        canGoPrevious={false}
        onClose={onClose}
        onNextStep={onNextStep}
        onPreviousStep={onPreviousStep}
        onOpenHelp={onOpenHelp}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(onNextStep).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Open Help" }));
    expect(onOpenHelp).toHaveBeenCalledTimes(1);

    rerender(
      <GameplayTourDialog
        visible
        steps={[
          {
            id: "one",
            selector: null,
            titleKey: "tour.step.one.title",
            descriptionKey: "tour.step.one.description",
          },
          {
            id: "two",
            selector: null,
            titleKey: "tour.step.two.title",
            descriptionKey: "tour.step.two.description",
          },
        ]}
        stepIndex={1}
        canGoPrevious={true}
        onClose={onClose}
        onNextStep={onNextStep}
        onPreviousStep={onPreviousStep}
        onOpenHelp={onOpenHelp}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(onPreviousStep).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Finish" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows the tour dialog above the keyboard on keyboard step", () => {
    render(
      <GameplayTourDialog
        visible
        steps={[
          {
            id: "keyboard",
            selector: null,
            titleKey: "tour.step.two.title",
            descriptionKey: "tour.step.two.description",
          },
        ]}
        stepIndex={0}
        canGoPrevious={false}
        onClose={() => undefined}
        onNextStep={() => undefined}
        onPreviousStep={() => undefined}
        onOpenHelp={() => undefined}
      />,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toContain("top-4");
    expect(dialog.className).toContain("bottom-auto");
  });
});
