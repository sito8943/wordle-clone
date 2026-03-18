import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ProfileEditorSection from "./ProfileEditorSection";

describe("ProfileEditorSection", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders readonly profile card and success status", () => {
    render(
      <ProfileEditorSection
        editing={false}
        savedMessage="Configuration saved."
        name="Player"
        code="AB12"
        score={14}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole("status")).toBeTruthy();
    const nameInput = screen.getByLabelText("Name:") as HTMLInputElement;
    const scoreInput = screen.getByLabelText("Score:") as HTMLInputElement;

    expect(nameInput.value).toBe("Player");
    expect(scoreInput.value).toBe("14");
    expect(nameInput.readOnly).toBe(true);
  });

  it("renders editable profile card while editing", () => {
    render(
      <ProfileEditorSection
        editing
        savedMessage=""
        name="Player"
        code="AB12"
        score={14}
        onSubmit={vi.fn().mockResolvedValue(null)}
      />,
    );

    expect(screen.getByRole("button", { name: "Save" })).toBeTruthy();
    const nameInput = screen.getByLabelText("Name:") as HTMLInputElement;
    expect(nameInput.readOnly).toBe(false);
  });
});
