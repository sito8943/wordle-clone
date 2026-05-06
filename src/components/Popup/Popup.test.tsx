import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Popup } from "./index";
import { PopupProvider } from "@providers/Popup";
import { POPUP_IMMEDIATE_DISMISS_GUARD_MS } from "./constants";

afterEach(() => {
  cleanup();
  document.documentElement.classList.remove("wordle-animations-disabled");
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

  it("adds toggle accessibility attributes to non-interactive triggers", async () => {
    render(
      <Popup content="Popup content">
        <div aria-label="Trigger element">Trigger</div>
      </Popup>,
    );

    const trigger = screen.getByLabelText("Trigger element");
    expect(trigger.getAttribute("role")).toBe("button");
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeTruthy();
      expect(trigger.getAttribute("aria-expanded")).toBe("true");
      expect(trigger.getAttribute("aria-controls")).toBeTruthy();
    });
  });

  it("closes when focus moves outside trigger and popup panel", async () => {
    render(
      <div>
        <Popup content="Popup content">
          <div aria-label="Trigger element">Trigger</div>
        </Popup>
        <button type="button">Outside target</button>
      </div>,
    );

    const trigger = screen.getByLabelText("Trigger element");
    fireEvent.click(trigger);
    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeTruthy();
    });

    await new Promise<void>((resolve) => {
      setTimeout(resolve, POPUP_IMMEDIATE_DISMISS_GUARD_MS + 20);
    });

    fireEvent.focusIn(screen.getByRole("button", { name: "Outside target" }));

    await waitFor(() => {
      expect(screen.queryByRole("tooltip")).toBeNull();
    });
  });

  it("does not close when focus moves outside immediately after opening", async () => {
    render(
      <div>
        <Popup content="Popup content">
          <div aria-label="Trigger element">Trigger</div>
        </Popup>
        <button type="button">Outside target</button>
      </div>,
    );

    const trigger = screen.getByLabelText("Trigger element");
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeTruthy();
    });

    fireEvent.focusIn(screen.getByRole("button", { name: "Outside target" }));

    expect(screen.getByRole("tooltip")).toBeTruthy();
  });

  it("allows interacting with popup content", async () => {
    const onAction = vi.fn();

    render(
      <Popup
        content={
          <button type="button" onClick={onAction}>
            Popup action
          </button>
        }
      >
        <div aria-label="Trigger element">Trigger</div>
      </Popup>,
    );

    fireEvent.click(screen.getByLabelText("Trigger element"));

    const actionButton = await screen.findByRole("button", {
      name: "Popup action",
    });
    fireEvent.click(actionButton);

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("tooltip")).toBeTruthy();
  });

  it("closes without transition delay when animations are disabled", async () => {
    document.documentElement.classList.add("wordle-animations-disabled");

    render(
      <Popup content="Popup content">
        <div aria-label="Trigger element">Trigger</div>
      </Popup>,
    );

    const trigger = screen.getByLabelText("Trigger element");
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeTruthy();
    });

    fireEvent.click(trigger);
    await waitFor(
      () => {
        expect(screen.queryByRole("tooltip")).toBeNull();
      },
      { timeout: 120 },
    );
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
