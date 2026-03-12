import type { JSX } from "react";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Board, Keyboard, SessionResumeDialog } from "../components";
import { useHomeController } from "../hooks";

const Home = (): JSX.Element => {
  const {
    answer,
    guesses,
    current,
    gameOver,
    won,
    message,
    handleKey,
    showResumeDialog,
    continuePreviousBoard,
    startNewBoard,
    refreshBoard,
  } = useHomeController();

  return (
    <>
      {message && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed left-1/2 top-5 z-10 -translate-x-1/2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white shadow-lg"
        >
          {message}
        </div>
      )}
      {showResumeDialog && (
        <SessionResumeDialog
          onContinue={continuePreviousBoard}
          onStartNew={startNewBoard}
        />
      )}
      <main className="flex flex-1 flex-col">
        <section className="flex flex-1 flex-col items-center justify-center gap-6 py-6 max-sm:py-2">
          <div className="w-full max-w-md flex justify-end">
            <button
              onClick={refreshBoard}
              aria-label="Refresh"
              className="inline-flex items-center gap-2 rounded bg-neutral-900 px-4 max-sm:px-2 py-2 text-sm font-semibold text-white hover:bg-neutral-700"
            >
              <FontAwesomeIcon icon={faRotateRight} aria-hidden="true" />
              <span className="max-sm:hidden">Refresh</span>
            </button>
          </div>

          <Board guesses={guesses} current={current} gameOver={gameOver} />

          {gameOver && (
            <>
              <p className="text-center text-base font-semibold text-neutral-800 sm:text-lg">
                {won
                  ? `You got it in ${guesses.length}!`
                  : `The word was: ${answer}`}
              </p>
            </>
          )}
        </section>

        <Keyboard guesses={guesses} onKey={handleKey} />
      </main>
    </>
  );
};

export default Home;
