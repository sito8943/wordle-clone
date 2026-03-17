import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Button from "./Button";

afterEach(cleanup);

describe("Button", () => {
  it("renders children as text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeTruthy();
  });

  it("uses type='button' by default", () => {
    render(<Button>Submit</Button>);
    expect(screen.getByRole("button").getAttribute("type")).toBe("button");
  });

  it("forwards type prop", () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole("button").getAttribute("type")).toBe("submit");
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Click
      </Button>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("applies disabled attribute when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toHaveProperty("disabled", true);
  });

  it("applies solid variant styles by default", () => {
    render(<Button>Solid</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-primary");
  });

  it("applies outline variant styles", () => {
    render(<Button variant="outline">Outline</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("border");
  });

  it("applies ghost variant styles", () => {
    render(<Button variant="ghost">Ghost</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("hover:bg-primary");
  });

  it("applies secondary color styles", () => {
    render(<Button color="secondary">Secondary</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-secondary");
  });

  it("applies neutral color styles", () => {
    render(<Button color="neutral">Neutral</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-neutral-900");
  });

  it("merges custom className", () => {
    render(<Button className="custom-class">Custom</Button>);
    expect(screen.getByRole("button").className).toContain("custom-class");
  });

  it("hides label on mobile when hideLabelOnMobile is true", () => {
    render(<Button hideLabelOnMobile>Hidden</Button>);
    const span = screen.getByText("Hidden");
    expect(span.className).toContain("max-sm:hidden");
  });
});
