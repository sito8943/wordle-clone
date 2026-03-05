import { useState, useEffect, useCallback, useMemo } from "react";
import { checkGuess } from "../utils/checker";
import { getRandomWord, isValidWord } from "../utils/words";
import type { GuessResult } from "./types";

export default function useWordle() {
  const [answer] = useState(getRandomWord);
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [current, setCurrent] = useState("");
  const [message, setMessage] = useState("");
  const [gameOver, setGameOver] = useState(false);

  // pure computation of whether the answer has been guessed
  const won = useMemo(
    () => guesses.some((g) => g.word === answer),
    [guesses, answer],
  );

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 1800);
  };

  const checkInput = useCallback(
    (input: string) => {
      if (input.length < 5) {
        showMessage("Not enough letters");
        return false;
      }
      if (!isValidWord(input)) {
        showMessage("Not in word list");
        return false;
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
    },
    [answer, current],
  );

  const removeLetter = useCallback(() => {
    setCurrent((prev) => prev.slice(0, -1));
  }, []);

  const addLetter = useCallback(
    (letter: string) => {
      if (current.length < 5) {
        setCurrent((prev) => prev + letter);
      }
    },
    [current],
  );

  const handleKey = useCallback(
    (key: string) => {
      if (gameOver) return;

      if (key === "ENTER") {
        return checkInput(current);
      }

      if (key === "BACKSPACE") {
        return removeLetter();
      }

      if (/^[A-Z]$/.test(key)) {
        return addLetter(key);
      }
    },
    [gameOver, current, checkInput, removeLetter, addLetter],
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
