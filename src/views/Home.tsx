import type { JSX } from "react";
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
        <section className="flex flex-1 flex-col items-center justify-center gap-6 py-6">
          <Board guesses={guesses} current={current} gameOver={gameOver} />

          {gameOver && (
            <>
              <p className="text-center text-base font-semibold text-neutral-800 sm:text-lg">
                {won
                  ? `You got it in ${guesses.length}!`
                  : `The word was: ${answer}`}
              </p>
              <button
                onClick={() => {
                  refreshBoard();
                }}
              >
                Refresh
              </button>
            </>
          )}
        </section>

        <Keyboard guesses={guesses} onKey={handleKey} />
      </main>
    </>
  );
};

export default Home;
