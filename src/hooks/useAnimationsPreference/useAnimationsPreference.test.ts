import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAnimationsPreference } from "./index";
import { WORDLE_ANIMATIONS_DISABLED_STORAGE_KEY } from "@domain/wordle";
import { WORDLE_ANIMATIONS_DISABLED_CLASSNAME } from "./constants";

beforeEach(() => localStorage.clear());
afterEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove(
    WORDLE_ANIMATIONS_DISABLED_CLASSNAME,
  );
});

describe("useAnimationsPreference", () => {
  it("returns animationsDisabled as false by default", () => {
    const { result } = renderHook(() => useAnimationsPreference());
    expect(result.current.animationsDisabled).toBe(false);
  });

  it("returns startAnimationsEnabled as true by default", () => {
    const { result } = renderHook(() => useAnimationsPreference());
    expect(result.current.startAnimationsEnabled).toBe(true);
  });

  it("reads stored value from localStorage", () => {
    localStorage.setItem(
      WORDLE_ANIMATIONS_DISABLED_STORAGE_KEY,
      JSON.stringify(true),
    );
    const { result } = renderHook(() => useAnimationsPreference());
    expect(result.current.animationsDisabled).toBe(true);
    expect(result.current.startAnimationsEnabled).toBe(false);
  });

  it("sets animationsDisabled to true", () => {
    const { result } = renderHook(() => useAnimationsPreference());

    act(() => {
      result.current.setAnimationsDisabled(true);
    });

    expect(result.current.animationsDisabled).toBe(true);
    expect(result.current.startAnimationsEnabled).toBe(false);
  });

  it("sets animationsDisabled to false", () => {
    localStorage.setItem(
      WORDLE_ANIMATIONS_DISABLED_STORAGE_KEY,
      JSON.stringify(true),
    );
    const { result } = renderHook(() => useAnimationsPreference());

    act(() => {
      result.current.setAnimationsDisabled(false);
    });

    expect(result.current.animationsDisabled).toBe(false);
  });

  it("toggles animationsDisabled", () => {
    const { result } = renderHook(() => useAnimationsPreference());

    act(() => {
      result.current.toggleAnimationsDisabled();
    });
    expect(result.current.animationsDisabled).toBe(true);

    act(() => {
      result.current.toggleAnimationsDisabled();
    });
    expect(result.current.animationsDisabled).toBe(false);
  });

  it("persists the preference to localStorage", () => {
    const { result } = renderHook(() => useAnimationsPreference());

    act(() => {
      result.current.setAnimationsDisabled(true);
    });

    expect(
      JSON.parse(localStorage.getItem(WORDLE_ANIMATIONS_DISABLED_STORAGE_KEY)!),
    ).toBe(true);
  });

  it("adds disabled class to document when applyToDocument is true", () => {
    const { result } = renderHook(() =>
      useAnimationsPreference({ applyToDocument: true }),
    );

    act(() => {
      result.current.setAnimationsDisabled(true);
    });

    expect(
      document.documentElement.classList.contains(
        WORDLE_ANIMATIONS_DISABLED_CLASSNAME,
      ),
    ).toBe(true);
  });

  it("removes disabled class when animations are re-enabled", () => {
    document.documentElement.classList.add(
      WORDLE_ANIMATIONS_DISABLED_CLASSNAME,
    );
    localStorage.setItem(
      WORDLE_ANIMATIONS_DISABLED_STORAGE_KEY,
      JSON.stringify(true),
    );

    const { result } = renderHook(() =>
      useAnimationsPreference({ applyToDocument: true }),
    );

    act(() => {
      result.current.setAnimationsDisabled(false);
    });

    expect(
      document.documentElement.classList.contains(
        WORDLE_ANIMATIONS_DISABLED_CLASSNAME,
      ),
    ).toBe(false);
  });

  it("dispatches a sync event when preference changes", () => {
    const received: boolean[] = [];
    const handler = (e: Event) =>
      received.push((e as CustomEvent<boolean>).detail);
    window.addEventListener("wordle:animations-preference:sync", handler);

    const { result } = renderHook(() => useAnimationsPreference());

    act(() => {
      result.current.setAnimationsDisabled(true);
    });

    expect(received).toContain(true);
    window.removeEventListener("wordle:animations-preference:sync", handler);
  });
});
