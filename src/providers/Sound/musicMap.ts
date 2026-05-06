import classicTrack from "../../assets/wordle-classic.mp3";
import lightningTrack from "../../assets/wordle-lightning.mp3";
import zenTrack from "../../assets/wordle-zen.mp3";
import type { SoundMusicMap, SoundMusicTrack } from "./types";

export const WORDLE_MUSIC_MAP: SoundMusicMap<SoundMusicTrack> = {
  classic: {
    src: classicTrack,
    channelId: "music",
    loop: true,
    volume: 0.4,
    preload: "auto",
  },
  lightning: {
    src: lightningTrack,
    channelId: "music",
    loop: true,
    volume: 0.42,
    preload: "auto",
  },
  zen: {
    src: zenTrack,
    channelId: "music",
    loop: true,
    volume: 0.38,
    preload: "auto",
  },
};
