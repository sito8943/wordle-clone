import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import SplashScreen from "./SplashScreen";

afterEach(cleanup);

describe("SplashScreen", () => {
  it("renders with role='status'", () => {
    render(<SplashScreen />);
    expect(screen.getByRole("status")).toBeTruthy();
  });

  it("has accessible aria-label", () => {
    render(<SplashScreen />);
    expect(screen.getByLabelText("Loading Wordle")).toBeTruthy();
  });

  it("renders the Wordle heading", () => {
    render(<SplashScreen />);
    expect(screen.getByText("Wordle")).toBeTruthy();
  });

  it("applies splash-screen class to the container", () => {
    const { container } = render(<SplashScreen />);
    expect(container.firstChild).toHaveProperty(
      "className",
      expect.stringContaining("splash-screen"),
    );
  });
});
