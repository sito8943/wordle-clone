import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from ".";

interface ThrowerProps {
  shouldThrow: boolean;
}

const Thrower = ({ shouldThrow }: ThrowerProps) => {
  if (shouldThrow) {
    throw new Error("boom");
  }

  return <p>All good</p>;
};

describe("ErrorBoundary", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders children while there is no error", () => {
    render(
      <ErrorBoundary>
        <Thrower shouldThrow={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("All good")).toBeTruthy();
  });

  it("renders the fallback when a child throws", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    render(
      <ErrorBoundary>
        <Thrower shouldThrow />
      </ErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toBeTruthy();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("resets when reset keys change", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const { rerender } = render(
      <ErrorBoundary resetKeys={["step-1"]}>
        <Thrower shouldThrow />
      </ErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toBeTruthy();

    rerender(
      <ErrorBoundary resetKeys={["step-2"]}>
        <Thrower shouldThrow={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("All good")).toBeTruthy();
  });

  it("supports a custom fallback renderer", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(
      <ErrorBoundary
        fallback={({ error }) => <p>{`Failed: ${error.message}`}</p>}
      >
        <Thrower shouldThrow />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Failed: boom")).toBeTruthy();
  });
});
