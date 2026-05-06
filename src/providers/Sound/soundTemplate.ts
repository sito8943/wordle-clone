import { createSoundTemplate } from "sito-sound-provider";
import type { SoundEvent, SoundMusicTrack } from "./types";

export const soundTemplate = createSoundTemplate<SoundEvent, SoundMusicTrack>();
