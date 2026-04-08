import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import DictionaryChecksumDialog from "./DictionaryChecksumDialog";

afterEach(cleanup);

describe("DictionaryChecksumDialog", () => {
  it("renders the dialog when visible", () => {
    render(<DictionaryChecksumDialog visible onAccept={() => undefined} />);

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText("Dictionary updated")).toBeTruthy();
  });

  it("does not render when visible is false", () => {
    render(
      <DictionaryChecksumDialog visible={false} onAccept={() => undefined} />,
    );

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders a single accept action", () => {
    render(<DictionaryChecksumDialog visible onAccept={() => undefined} />);

    expect(
      screen.getByRole("button", { name: "Accept and restart" }),
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Cancel" })).toBeNull();
  });

  it("calls onAccept when clicking the accept action", () => {
    const onAccept = vi.fn();
    render(<DictionaryChecksumDialog visible onAccept={onAccept} />);

    fireEvent.click(screen.getByRole("button", { name: "Accept and restart" }));

    expect(onAccept).toHaveBeenCalledTimes(1);
  });
});
