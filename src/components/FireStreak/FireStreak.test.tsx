import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@i18n", () => {
  const dictionary: Record<string, string> = {
    "common.streakLabel": "Streak: {{count}}",
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
import FireStreak from "./FireStreak";

afterEach(cleanup);

describe("FireStreak", () => {
  it("renders the streak count", () => {
    render(<FireStreak streak={5} />);
    expect(screen.getByText(/5/)).toBeTruthy();
  });

  it("renders 'Streak: N' label by default", () => {
    render(<FireStreak streak={3} />);
    expect(
      screen.getByText(i18n.t("common.streakLabel", { count: 3 })),
    ).toBeTruthy();
  });

  it("renders only the number when noLabel is true", () => {
    render(<FireStreak streak={3} noLabel />);
    expect(screen.getByText("3")).toBeTruthy();
    expect(screen.queryByText(/Streak/)).toBeNull();
  });

  it("shows the flame icon when streak is 2 or more", () => {
    const { container } = render(<FireStreak streak={2} />);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("does not show the flame icon when streak is below 2", () => {
    const { container } = render(<FireStreak streak={1} />);
    expect(container.querySelector("svg")).toBeNull();
  });

  it("does not show flame for streak of 0", () => {
    const { container } = render(<FireStreak streak={0} />);
    expect(container.querySelector("svg")).toBeNull();
  });

  it("uses amber color class when streak >= 2", () => {
    render(<FireStreak streak={5} />);
    const label = screen.getByRole("generic", {
      name: i18n.t("common.streakLabel", { count: 5 }),
    });
    expect(label.className).toContain("text-amber-800");
  });

  it("uses neutral color class when streak < 2", () => {
    render(<FireStreak streak={1} />);
    const label = screen.getByRole("generic", {
      name: i18n.t("common.streakLabel", { count: 1 }),
    });
    expect(label.className).toContain("text-neutral-600");
  });

  it("applies sm size classes when size='sm'", () => {
    render(<FireStreak streak={1} size="sm" />);
    const label = screen.getByRole("generic", {
      name: i18n.t("common.streakLabel", { count: 1 }),
    });
    expect(label.className).toContain("text-xs");
  });

  it("applies md size classes by default", () => {
    render(<FireStreak streak={1} />);
    const label = screen.getByRole("generic", {
      name: i18n.t("common.streakLabel", { count: 1 }),
    });
    expect(label.className).toContain("py-1");
  });

  it("merges custom className", () => {
    render(<FireStreak streak={1} className="custom-class" />);
    const label = screen.getByRole("generic", {
      name: i18n.t("common.streakLabel", { count: 1 }),
    });
    expect(label.className).toContain("custom-class");
  });

  it("sets aria-label on the container", () => {
    render(<FireStreak streak={4} />);
    expect(
      screen.getByLabelText(i18n.t("common.streakLabel", { count: 4 })),
    ).toBeTruthy();
  });

  it("sanitizes negative streak values", () => {
    render(<FireStreak streak={-3} />);
    expect(screen.getByText(/0/)).toBeTruthy();
    const label = screen.getByRole("generic", { name: /0/ });
    expect(label.className).toContain("text-neutral-600");
  });
});
