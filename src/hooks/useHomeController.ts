import { useEffect, useRef } from "react";
import { usePlayer } from "../providers";
import useWordle from "./useWordle";

export default function useHomeController() {
  const { increaseScore } = usePlayer();
  const wordle = useWordle();

  const alreadyScored = useRef(false);
  const hydrated = useRef(false);

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      alreadyScored.current = wordle.won;
      return;
    }

    if (wordle.won && !alreadyScored.current) {
      increaseScore(wordle.guesses.length);
      alreadyScored.current = true;
    }

    if (!wordle.won) {
      alreadyScored.current = false;
    }
  }, [wordle.won, wordle.guesses.length, increaseScore]);

  const refreshBoard = () => {
    wordle.refresh();
    alreadyScored.current = false;
  };

  return {
    ...wordle,
    refreshBoard,
  };
}
