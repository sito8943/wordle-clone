import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EditableProfileCard, ProfileCard } from "./index";

describe("ProfileCard", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders name and score in readonly mode", () => {
    render(<ProfileCard name="Player" score={12} />);

    const nameInput = screen.getByLabelText("Name:") as HTMLInputElement;
    const scoreInput = screen.getByLabelText("Score:") as HTMLInputElement;

    expect(nameInput.value).toBe("Player");
    expect(scoreInput.value).toBe("12");
    expect(nameInput.readOnly).toBe(true);
    expect(scoreInput.readOnly).toBe(true);
  });

  it("submits the edited name", () => {
    const onSubmit = vi.fn();
    render(
      <EditableProfileCard name="Player" score={12} onSubmit={onSubmit} />,
    );

    fireEvent.change(screen.getByLabelText("Name:"), {
      target: { value: "Ana" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(onSubmit).toHaveBeenCalledWith("Ana");
  });
});
