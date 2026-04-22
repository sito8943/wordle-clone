import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { ApiProvider } from "./index";
import { useApi } from "./useApi";
import { DailyWordClient } from "@api/dailyWord";
import { ScoreClient } from "@api/score";
import { WordDictionaryClient } from "@api/words";

const wrapper = ({ children }: { children: ReactNode }) => (
  <ApiProvider>{children}</ApiProvider>
);

describe("ApiProvider", () => {
  it("provides a ScoreClient instance", () => {
    const { result } = renderHook(() => useApi(), { wrapper });
    expect(result.current.scoreClient).toBeInstanceOf(ScoreClient);
  });

  it("provides a WordDictionaryClient instance", () => {
    const { result } = renderHook(() => useApi(), { wrapper });
    expect(result.current.wordDictionaryClient).toBeInstanceOf(
      WordDictionaryClient,
    );
  });

  it("provides a DailyWordClient instance", () => {
    const { result } = renderHook(() => useApi(), { wrapper });
    expect(result.current.dailyWordClient).toBeInstanceOf(DailyWordClient);
  });

  it("exposes convexEnabled as a boolean", () => {
    const { result } = renderHook(() => useApi(), { wrapper });
    expect(typeof result.current.convexEnabled).toBe("boolean");
  });

  it("convexEnabled is false in test mode (no convex URL configured)", () => {
    const { result } = renderHook(() => useApi(), { wrapper });
    // In test env, env.convexUrl is undefined → gateway.isConfigured = false
    expect(result.current.convexEnabled).toBe(false);
  });

  it("returns the same client instances across re-renders", () => {
    const { result, rerender } = renderHook(() => useApi(), { wrapper });
    const first = result.current;

    rerender();

    expect(result.current.scoreClient).toBe(first.scoreClient);
    expect(result.current.wordDictionaryClient).toBe(
      first.wordDictionaryClient,
    );
    expect(result.current.dailyWordClient).toBe(first.dailyWordClient);
  });
});

describe("useApi", () => {
  it("throws when used outside ApiProvider", () => {
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    expect(() => renderHook(() => useApi())).toThrow(
      "useApi must be used within an ApiProvider",
    );

    consoleSpy.mockRestore();
  });
});
