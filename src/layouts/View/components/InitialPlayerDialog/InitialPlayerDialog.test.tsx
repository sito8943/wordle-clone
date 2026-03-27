import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import InitialPlayerDialog from "./InitialPlayerDialog";

describe("InitialPlayerDialog", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows a validation error when trying to create a profile without a name", async () => {
    render(
      <InitialPlayerDialog
        visible
        onClose={vi.fn()}
        initialName=""
        onConfirm={vi.fn().mockResolvedValue(null)}
        onRecover={vi.fn().mockResolvedValue(null)}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Start playing" }));

    expect(screen.getByText("Name cannot be empty.")).toBeTruthy();
  });

  it("runs name validation before confirming profile creation", async () => {
    const onValidateName = vi.fn().mockResolvedValue("Name is not available.");
    const onConfirm = vi.fn().mockResolvedValue(null);

    render(
      <InitialPlayerDialog
        visible
        onClose={vi.fn()}
        initialName=""
        onConfirm={onConfirm}
        onRecover={vi.fn().mockResolvedValue(null)}
        onValidateName={onValidateName}
      />,
    );

    fireEvent.change(screen.getByLabelText("Player nick name"), {
      target: { value: "Ana" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Start playing" }));

    expect(onValidateName).toHaveBeenCalledWith("Ana");
    expect(await screen.findByText("Name is not available.")).toBeTruthy();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("normalizes the recovery code input to uppercase before submitting", async () => {
    const onRecover = vi.fn().mockResolvedValue(null);

    render(
      <InitialPlayerDialog
        visible
        onClose={vi.fn()}
        initialName=""
        onConfirm={vi.fn().mockResolvedValue(null)}
        onRecover={onRecover}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Recover settings" }));
    fireEvent.change(screen.getByLabelText("Recovery code"), {
      target: { value: "ab12" },
    });

    expect(
      (screen.getByLabelText("Recovery code") as HTMLInputElement).value,
    ).toBe("AB12");

    fireEvent.click(
      screen.getAllByRole("button", { name: "Recover settings" })[1],
    );

    expect(onRecover).toHaveBeenCalledWith("AB12");
  });
});
