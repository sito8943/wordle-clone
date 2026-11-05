import { useTrack } from "@sito/feature-usage/react";
import type { WordleFeature } from "./types";

/** `const track = useTrackFeature(); track("page.home")`: typed to the wordle catalogue. */
const useTrackFeature = () => useTrack<WordleFeature>();

export { useTrackFeature };
