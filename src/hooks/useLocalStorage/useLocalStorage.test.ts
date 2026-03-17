import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "./index";

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

describe("useLocalStorage", () => {
  it("returns the initial value when nothing is stored", () => {
    const { result } = renderHook(() => useLocalStorage("key", "default"));
    expect(result.current[0]).toBe("default");
  });

  it("accepts a factory function as initial value", () => {
    const { result } = renderHook(() =>
      useLocalStorage("key", () => "from-factory"),
    );
    expect(result.current[0]).toBe("from-factory");
  });

  it("reads an existing value from localStorage", () => {
    localStorage.setItem("key", JSON.stringify("stored"));
    const { result } = renderHook(() => useLocalStorage("key", "default"));
    expect(result.current[0]).toBe("stored");
  });

  it("falls back to initial value when stored JSON is invalid", () => {
    localStorage.setItem("key", "not-valid-json{{");
    const { result } = renderHook(() => useLocalStorage("key", "fallback"));
    expect(result.current[0]).toBe("fallback");
  });

  it("persists the new value to localStorage when set", async () => {
    const { result } = renderHook(() => useLocalStorage("key", "initial"));

    act(() => {
      result.current[1]("updated");
    });

    expect(result.current[0]).toBe("updated");
    expect(JSON.parse(localStorage.getItem("key")!)).toBe("updated");
  });

  it("handles object values", async () => {
    const { result } = renderHook(() =>
      useLocalStorage<{ count: number }>("obj-key", { count: 0 }),
    );

    act(() => {
      result.current[1]({ count: 5 });
    });

    expect(result.current[0]).toEqual({ count: 5 });
  });

  it("does not throw when localStorage.setItem throws", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    const { result } = renderHook(() => useLocalStorage("key", "initial"));

    expect(() =>
      act(() => {
        result.current[1]("new-value");
      }),
    ).not.toThrow();

    vi.restoreAllMocks();
  });

  it("supports boolean values", () => {
    const { result } = renderHook(() => useLocalStorage("bool-key", false));

    act(() => {
      result.current[1](true);
    });

    expect(result.current[0]).toBe(true);
  });
});
