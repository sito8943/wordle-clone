import { describe, expect, it } from "vitest";
import { getChannelLabel, getChannelVolumeValue, getVolumeIcon } from "./utils";

const translate = (key: string): string => key;

describe("getChannelVolumeValue", () => {
  it("returns zero when channel is muted", () => {
    expect(
      getChannelVolumeValue({
        id: "music",
        label: "Music",
        kind: "music",
        enabled: true,
        volume: 70,
        muted: true,
      }),
    ).toBe(0);
  });

  it("returns zero when channel is disabled", () => {
    expect(
      getChannelVolumeValue({
        id: "music",
        label: "Music",
        kind: "music",
        enabled: false,
        volume: 70,
        muted: false,
      }),
    ).toBe(0);
  });

  it("returns channel volume when active", () => {
    expect(
      getChannelVolumeValue({
        id: "music",
        label: "Music",
        kind: "music",
        enabled: true,
        volume: 70,
        muted: false,
      }),
    ).toBe(70);
  });
});

describe("getChannelLabel", () => {
  it("returns translated default labels by channel kind", () => {
    expect(
      getChannelLabel(
        {
          id: "master",
          label: "Master",
          kind: "master",
          enabled: true,
          volume: 100,
          muted: false,
        },
        translate,
      ),
    ).toBe("play.volumeDialog.channels.master");
    expect(
      getChannelLabel(
        {
          id: "music",
          label: "Music",
          kind: "music",
          enabled: true,
          volume: 100,
          muted: false,
        },
        translate,
      ),
    ).toBe("play.volumeDialog.channels.music");
    expect(
      getChannelLabel(
        {
          id: "sfx",
          label: "SFX",
          kind: "sfx",
          enabled: true,
          volume: 100,
          muted: false,
        },
        translate,
      ),
    ).toBe("play.volumeDialog.channels.sfx");
  });

  it("falls back to custom channel label", () => {
    expect(
      getChannelLabel(
        {
          id: "ambience",
          label: "Ambience",
          kind: "custom",
          enabled: true,
          volume: 100,
          muted: false,
        },
        translate,
      ),
    ).toBe("Ambience");
  });
});

describe("getVolumeIcon", () => {
  it("returns different icons by mute/volume states", () => {
    expect(getVolumeIcon(100, true)).toBeDefined();
    expect(getVolumeIcon(0, false)).toBeDefined();
    expect(getVolumeIcon(20, false)).toBeDefined();
    expect(getVolumeIcon(80, false)).toBeDefined();
  });
});
