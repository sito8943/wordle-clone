import type { JSX } from "react";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";
import {
  Board,
  Button,
  Keyboard,
  RefreshConfirmationDialog,
  SessionResumeDialog,
} from "../components";
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
    startAnimationSeed,
    startAnimationsEnabled,
    keyboardEntryAnimationEnabled,
    showResumeDialog,
    showRefreshDialog,
    continuePreviousBoard,
    startNewBoard,
    refreshBoard,
    confirmRefreshBoard,
    cancelRefreshBoard,
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
      {!showResumeDialog && showRefreshDialog && (
        <RefreshConfirmationDialog
          onCancel={cancelRefreshBoard}
          onConfirm={confirmRefreshBoard}
        />
      )}
      <main className="flex flex-1 flex-col">
        <section className="flex flex-1 flex-col items-center justify-start gap-6 max-sm:gap-2 py-6 max-sm:py-2">
          <div className="w-full max-w-md flex justify-end">
            <Button
              onClick={refreshBoard}
              aria-label="Refresh"
              icon={faRotateRight}
              className="max-sm:px-2"
              hideLabelOnMobile
            >
              Refresh
            </Button>
          </div>

          <Board
            key={`board-${startAnimationSeed}`}
            guesses={guesses}
            current={current}
            gameOver={gameOver}
            animateEntry={startAnimationsEnabled && startAnimationSeed > 0}
          />

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

        <Keyboard
          guesses={guesses}
          onKey={handleKey}
          animateEntry={keyboardEntryAnimationEnabled}
        />
      </main>
    </>
  );
};

export default Home;
