import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSessionId, getOrCreateSessionId } from "./session";
import { WORDLE_SESSION_STORAGE_KEY } from "./constants";

describe("createSessionId", () => {
  it("returns a non-empty string", () => {
    expect(typeof createSessionId()).toBe("string");
    expect(createSessionId().length).toBeGreaterThan(0);
  });

  it("uses crypto.randomUUID when available", () => {
    const mockUUID = "123e4567-e89b-12d3-a456-426614174000";
    const spy = vi
      .spyOn(crypto, "randomUUID")
      .mockReturnValue(mockUUID as ReturnType<typeof crypto.randomUUID>);

    expect(createSessionId()).toBe(mockUUID);
    spy.mockRestore();
  });

  it("falls back to timestamp-based ID when crypto.randomUUID is unavailable", () => {
    const originalCrypto = globalThis.crypto;
    vi.stubGlobal("crypto", {} as Crypto);

    const id = createSessionId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);

    vi.stubGlobal("crypto", originalCrypto);
  });

  it("generates unique IDs on each call", () => {
    const id1 = createSessionId();
    const id2 = createSessionId();
    expect(id1).not.toBe(id2);
  });
});

describe("getOrCreateSessionId", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it("creates and stores a new session ID when none exists", () => {
    const id = getOrCreateSessionId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
    expect(sessionStorage.getItem(WORDLE_SESSION_STORAGE_KEY)).toBe(id);
  });

  it("returns the existing session ID when one is already stored", () => {
    const existingId = "existing-session-id";
    sessionStorage.setItem(WORDLE_SESSION_STORAGE_KEY, existingId);

    expect(getOrCreateSessionId()).toBe(existingId);
  });

  it("does not overwrite an existing session ID", () => {
    const existingId = "do-not-overwrite";
    sessionStorage.setItem(WORDLE_SESSION_STORAGE_KEY, existingId);

    getOrCreateSessionId();

    expect(sessionStorage.getItem(WORDLE_SESSION_STORAGE_KEY)).toBe(existingId);
  });
});
