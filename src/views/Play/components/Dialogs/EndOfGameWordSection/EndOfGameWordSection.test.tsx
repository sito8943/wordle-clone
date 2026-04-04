import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { env } from "@config/env";
import EndOfGameWordSection from "./EndOfGameWordSection";

const defaultWordReportPhoneNumber = env.wordReportPhoneNumber;
const defaultWordReportButtonEnabled = env.wordReportButtonEnabled;

afterEach(() => {
  env.wordReportPhoneNumber = defaultWordReportPhoneNumber;
  env.wordReportButtonEnabled = defaultWordReportButtonEnabled;
  cleanup();
});

describe("EndOfGameWordSection", () => {
  it("renders the invalid word report link using the configured phone", () => {
    env.wordReportPhoneNumber = "+34 612 34 56 78";

    render(
      <EndOfGameWordSection
        answer="APPLE"
        sectionClassName="rounded-2xl bg-rose-50"
      />,
    );

    const reportLink = screen.getByTitle("I think this word is not valid");
    const href = reportLink.getAttribute("href");

    expect(href).toContain("https://wa.me/34612345678");
    expect(decodeURIComponent(href ?? "")).toContain(
      "I think this word is not valid: APPLE",
    );
  });

  it("disables the invalid word report link when phone is not configured", () => {
    env.wordReportPhoneNumber = undefined;

    render(
      <EndOfGameWordSection
        answer="APPLE"
        sectionClassName="rounded-2xl bg-rose-50"
      />,
    );

    const reportLink = screen.getByTitle("I think this word is not valid");

    expect(reportLink.getAttribute("href")).toBeNull();
    expect(reportLink.getAttribute("aria-disabled")).toBe("true");
  });

  it("hides the invalid word report button when feature flag is disabled", () => {
    env.wordReportButtonEnabled = false;

    render(
      <EndOfGameWordSection
        answer="APPLE"
        sectionClassName="rounded-2xl bg-rose-50"
      />,
    );

    expect(screen.queryByTitle("I think this word is not valid")).toBeNull();
  });
});
