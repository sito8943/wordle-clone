import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useThemePreference } from "./index";
import { THEME_PREFERENCE_STORAGE_KEY } from "./constants";

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

describe("useThemePreference", () => {
  it("returns 'system' as the default preference", () => {
    const { result } = renderHook(() => useThemePreference());
    expect(result.current.themePreference).toBe("system");
  });

  it("reads a stored preference from localStorage", () => {
    localStorage.setItem(THEME_PREFERENCE_STORAGE_KEY, JSON.stringify("dark"));
    const { result } = renderHook(() => useThemePreference());
    expect(result.current.themePreference).toBe("dark");
  });

  it("updates the preference when setThemePreference is called", () => {
    const { result } = renderHook(() => useThemePreference());

    act(() => {
      result.current.setThemePreference("dark");
    });

    expect(result.current.themePreference).toBe("dark");
  });

  it("persists the preference to localStorage", () => {
    const { result } = renderHook(() => useThemePreference());

    act(() => {
      result.current.setThemePreference("light");
    });

    expect(
      JSON.parse(localStorage.getItem(THEME_PREFERENCE_STORAGE_KEY)!),
    ).toBe("light");
  });

  it("falls back to default when an invalid preference is stored", () => {
    localStorage.setItem(
      THEME_PREFERENCE_STORAGE_KEY,
      JSON.stringify("invalid-theme"),
    );
    const { result } = renderHook(() => useThemePreference());
    expect(result.current.themePreference).toBe("system");
  });

  it("falls back to default when setThemePreference receives an invalid value", () => {
    const { result } = renderHook(() => useThemePreference());

    act(() => {
      result.current.setThemePreference("invalid" as never);
    });

    expect(result.current.themePreference).toBe("system");
  });

  it("dispatches a sync event when preference changes", () => {
    const received: string[] = [];
    window.addEventListener("wordle:theme-preference:sync", (e) => {
      received.push((e as CustomEvent).detail);
    });

    const { result } = renderHook(() => useThemePreference());

    act(() => {
      result.current.setThemePreference("dark");
    });

    expect(received).toContain("dark");
    window.removeEventListener("wordle:theme-preference:sync", () => {});
  });

  it("applies dark class to document when applyToDocument is true and preference is dark", () => {
    const { result } = renderHook(() =>
      useThemePreference({ applyToDocument: true }),
    );

    act(() => {
      result.current.setThemePreference("dark");
    });

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("removes dark class when preference switches to light", () => {
    document.documentElement.classList.add("dark");

    const { result } = renderHook(() =>
      useThemePreference({ applyToDocument: true }),
    );

    act(() => {
      result.current.setThemePreference("light");
    });

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
