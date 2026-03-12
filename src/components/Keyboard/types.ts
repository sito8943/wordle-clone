import type { GuessResult } from "../../hooks";

export interface KeyboardProps {
  guesses: GuessResult[];
  onKey: (key: string) => void;
  animateEntry?: boolean;
}
