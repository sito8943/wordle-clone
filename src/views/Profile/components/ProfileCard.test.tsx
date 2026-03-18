import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EditableProfileCard, ProfileCard } from "./index";

describe("ProfileCard", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders name and score in readonly mode", () => {
    render(<ProfileCard name="Player" code="AB12" score={12} />);

    const nameInput = screen.getByLabelText("Name:") as HTMLInputElement;
    const codeInput = screen.getByLabelText(
      "Recovery code:",
    ) as HTMLInputElement;
    const scoreInput = screen.getByLabelText("Score:") as HTMLInputElement;

    expect(nameInput.value).toBe("Player");
    expect(codeInput.value).toBe("AB12");
    expect(scoreInput.value).toBe("12");
    expect(nameInput.readOnly).toBe(true);
    expect(codeInput.readOnly).toBe(true);
    expect(scoreInput.readOnly).toBe(true);
  });

  it("submits the edited name", async () => {
    const onSubmit = vi.fn().mockResolvedValue(null);
    render(
      <EditableProfileCard
        name="Player"
        code="AB12"
        score={12}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText("Name:"), {
      target: { value: "Ana" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith("Ana");
    });
  });
});
