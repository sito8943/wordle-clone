import { useState, useEffect, useCallback } from "react";
import { checkGuess } from "../utils/checker";
import { getRandomWord, isValidWord } from "../utils/words";
import type { GuessResult } from "./types";

export default function useWordle() {
  const [answer] = useState(getRandomWord);
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [current, setCurrent] = useState("");
  const [message, setMessage] = useState("");
  const [gameOver, setGameOver] = useState(false);

  const won = guesses.some((g) => g.word === answer);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 1800);
  };

  const handleKey = useCallback(
    (key: string) => {
      if (gameOver) return;

      if (key === "ENTER") {
        if (current.length < 5) {
          showMessage("Not enough letters");
          return;
        }
        if (!isValidWord(current)) {
          showMessage("Not in word list");
          return;
        }
        const statuses = checkGuess(current, answer);
        const result: GuessResult = { word: current, statuses };
        setGuesses((prev) => {
          const next = [...prev, result];
          if (current === answer || next.length === 6) {
            setGameOver(true);
          }
          return next;
        });
        setCurrent("");
        return;
      }

      if (key === "BACKSPACE") {
        setCurrent((prev) => prev.slice(0, -1));
        return;
      }

      if (/^[A-Z]$/.test(key) && current.length < 5) {
        setCurrent((prev) => prev + key);
      }
    },
    [current, answer, gameOver],
  );

  const refresh = useCallback(() => {
    setGuesses([]);
    setCurrent("");
    setGameOver(false);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      handleKey(e.key === "Backspace" ? "BACKSPACE" : e.key.toUpperCase());
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleKey]);

  return {
    answer,
    guesses,
    current,
    gameOver,
    won,
    message,
    handleKey,
    refresh,
  };
}
