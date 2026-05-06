import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Popup } from "./index";
import { PopupProvider } from "@providers/Popup";

afterEach(() => {
  cleanup();
  const portalRoot = document.getElementById("wordle-popup-root");
  if (portalRoot?.parentElement) {
    portalRoot.parentElement.removeChild(portalRoot);
  }
});

describe("Popup", () => {
  it("does not open on hover", async () => {
    render(
      <Popup content="Popup content">
        <div aria-label="Trigger element">Trigger</div>
      </Popup>,
    );

    const trigger = screen.getByLabelText("Trigger element");
    fireEvent.mouseEnter(trigger);

    await waitFor(() => {
      expect(screen.queryByRole("tooltip")).toBeNull();
    });
  });

  it("toggles popup on click", async () => {
    render(
      <Popup content="Popup content">
        <div aria-label="Trigger element">Trigger</div>
      </Popup>,
    );

    const trigger = screen.getByLabelText("Trigger element");

    fireEvent.click(trigger);
    await waitFor(() => {
      expect(screen.getByRole("tooltip").textContent).toContain("Popup content");
    });

    fireEvent.click(trigger);
    await waitFor(() => {
      expect(screen.queryByRole("tooltip")).toBeNull();
    });
  });

  it("keeps popup open right after first click", async () => {
    render(
      <Popup content="Popup content">
        <div aria-label="Trigger element">Trigger</div>
      </Popup>,
    );

    const trigger = screen.getByLabelText("Trigger element");

    fireEvent.click(trigger);
    await waitFor(() => {
      expect(screen.getByRole("tooltip").textContent).toContain("Popup content");
    });

    await new Promise<void>((resolve) => {
      setTimeout(resolve, 120);
    });

    expect(screen.getByRole("tooltip").textContent).toContain("Popup content");
  });

  it("does not toggle popup when trigger click is prevented", async () => {
    render(
      <Popup content="Popup content">
        <div
          aria-label="Trigger element"
          onClick={(event) => {
            event.preventDefault();
          }}
        >
          Trigger
        </div>
      </Popup>,
    );

    const trigger = screen.getByLabelText("Trigger element");
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.queryByRole("tooltip")).toBeNull();
    });
  });

  it("uses PopupProvider portal root when available", async () => {
    render(
      <PopupProvider>
        <Popup content="Popup content">
          <div aria-label="Trigger element">Trigger</div>
        </Popup>
      </PopupProvider>,
    );

    const trigger = screen.getByLabelText("Trigger element");
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(document.getElementById("wordle-popup-root")).toBeTruthy();
    });

    const portalRoot = document.getElementById("wordle-popup-root");
    expect(portalRoot?.textContent).toContain("Popup content");
  });
});
