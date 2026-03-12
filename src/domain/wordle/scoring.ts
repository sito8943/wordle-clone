import { MAX_GUESSES } from "./constants";

export const getPointsForWin = (guessesUsed: number): number =>
  Math.max(0, MAX_GUESSES - guessesUsed + 1);
