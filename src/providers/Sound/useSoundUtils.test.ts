import { describe, expect, it, vi } from "vitest";
import { normalizeSoundContext } from "./useSoundUtils";

describe("normalizeSoundContext", () => {
  it("builds a master channel fallback when channels are missing", () => {
    const soundContext = normalizeSoundContext({
      soundEnabled: true,
      volume: 75,
      muted: false,
      setSoundEnabled: vi.fn(),
      setVolume: vi.fn(),
      setMuted: vi.fn(),
      playSound: vi.fn(),
    });

    expect(soundContext.channels).toEqual([
      expect.objectContaining({
        id: "master",
        kind: "master",
        enabled: true,
        volume: 75,
        muted: false,
      }),
    ]);
  });

  it("bridges master channel setters to legacy setters", () => {
    const setSoundEnabled = vi.fn();
    const setVolume = vi.fn();
    const setMuted = vi.fn();

    const soundContext = normalizeSoundContext({
      soundEnabled: true,
      volume: 100,
      muted: false,
      setSoundEnabled,
      setVolume,
      setMuted,
      playSound: vi.fn(),
    });

    soundContext.setChannelEnabled("master", false);
    soundContext.setChannelVolume("master", 33);
    soundContext.setChannelMuted("master", true);

    expect(setSoundEnabled).toHaveBeenCalledWith(false);
    expect(setVolume).toHaveBeenCalledWith(33);
    expect(setMuted).toHaveBeenCalledWith(true);
  });

  it("exposes no-op music methods when legacy context has no music api", () => {
    const soundContext = normalizeSoundContext({
      soundEnabled: true,
      volume: 100,
      muted: false,
      setSoundEnabled: vi.fn(),
      setVolume: vi.fn(),
      setMuted: vi.fn(),
      playSound: vi.fn(),
    });

    expect(() => soundContext.playMusic("classic")).not.toThrow();
    expect(() => soundContext.pauseMusic()).not.toThrow();
    expect(() => soundContext.resumeMusic()).not.toThrow();
    expect(() => soundContext.stopMusic()).not.toThrow();
    expect(soundContext.getActiveMusicTrack()).toBeNull();
  });
});
