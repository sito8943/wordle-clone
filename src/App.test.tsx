import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { PlayerProvider } from "./providers";

vi.mock("./utils/words", async () => {
  const actual = await vi.importActual<typeof import("./utils/words")>(
    "./utils/words",
  );

  return {
    ...actual,
    getRandomWord: () => "APPLE",
  };
});

describe("App", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    localStorage.clear();
    window.history.pushState({}, "", "/");
  });

  it("renders the main navigation", async () => {
    render(
      <PlayerProvider>
        <App />
      </PlayerProvider>,
    );

    expect(
      await screen.findByRole("heading", { name: "WORDLE" }),
    ).toBeTruthy();
    expect(screen.getByRole("link", { name: "Home" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Profile" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Scoreboard" })).toBeTruthy();
  });

  it("shows a validation message when submitting fewer than 5 letters", async () => {
    render(
      <PlayerProvider>
        <App />
      </PlayerProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Submit guess" }));

    const status = await screen.findByRole("status");
    expect(status.textContent).toBe("Not enough letters");
  });

  it("finishes a winning round and allows refreshing the board", async () => {
    render(
      <PlayerProvider>
        <App />
      </PlayerProvider>,
    );

    for (const letter of ["A", "P", "P", "L", "E"]) {
      fireEvent.click(screen.getByRole("button", { name: `Letter ${letter}` }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Submit guess" }));

    expect(await screen.findByText("You got it in 1!")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));

    await waitFor(() => {
      expect(screen.queryByText("You got it in 1!")).toBeNull();
    });
    expect(screen.queryByRole("button", { name: "Refresh" })).toBeNull();
  });

  it("lets the user edit the profile name", async () => {
    render(
      <PlayerProvider>
        <App />
      </PlayerProvider>,
    );

    fireEvent.click(screen.getByRole("link", { name: "Profile" }));
    expect(await screen.findByRole("heading", { name: "Profile" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("Name:"), {
      target: { value: "Ana" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    const nameInput = screen.getByLabelText("Name:") as HTMLInputElement;
    expect(nameInput.value).toBe("Ana");

    await waitFor(() => {
      const player = JSON.parse(localStorage.getItem("player") || "{}");
      expect(player.name).toBe("Ana");
    });
  });
});
