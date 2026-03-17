import type { JSX } from "react";
import { ErrorBoundary, ErrorFallback } from "@components";
import { Board } from "../components";
import { useHomeView } from "../providers";

const BoardSection = (): JSX.Element => {
  const { controller, animateTileEntry } = useHomeView();
  const {
    guesses,
    current,
    gameOver,
    won,
    answer,
    startAnimationSeed,
    startAnimationsEnabled,
    boardShakePulse,
    showHardModeFinalStretchBar,
    hardModeSecondsLeft,
    hardModeFinalStretchProgressPercent,
    activeRowHintStatuses,
    hintRevealPulse,
    hintRevealTileIndex,
  } = controller;

  return (
    <ErrorBoundary
      name="home-board"
      resetKeys={[
        guesses.length,
        current,
        gameOver,
        won,
        startAnimationSeed,
        boardShakePulse,
      ]}
      fallback={({ reset }) => (
        <ErrorFallback
          title="The board crashed."
          description="Retry to restore the current match view."
          actionLabel="Retry board"
          onAction={reset}
        />
      )}
    >
      <>
        {showHardModeFinalStretchBar && (
          <div
            role="progressbar"
            aria-label="Insane mode countdown"
            aria-valuemin={0}
            aria-valuemax={15}
            aria-valuenow={hardModeSecondsLeft}
            className="w-full max-w-md"
          >
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-blue-200/80 dark:bg-blue-950/50">
              <div
                className="h-full rounded-full bg-blue-500 transition-[width] duration-1000 ease-linear dark:bg-blue-400"
                style={{
                  width: `${hardModeFinalStretchProgressPercent}%`,
                }}
              />
            </div>
          </div>
        )}

        <Board
          key={`board-${startAnimationSeed}`}
          guesses={guesses}
          current={current}
          gameOver={gameOver}
          animateTileEntry={animateTileEntry}
          isLoss={gameOver && !won}
          animateEntry={startAnimationsEnabled && startAnimationSeed > 0}
          shakePulse={boardShakePulse}
          activeRowHintStatuses={activeRowHintStatuses}
          hintRevealPulse={hintRevealPulse}
          hintRevealTileIndex={hintRevealTileIndex}
        />

        {gameOver && (
          <p className="text-center text-base font-semibold text-neutral-800 dark:text-neutral-200 sm:text-lg">
            {won
              ? `You got it in ${guesses.length}!`
              : `The word was: ${answer}`}
          </p>
        )}
      </>
    </ErrorBoundary>
  );
};

export default BoardSection;
