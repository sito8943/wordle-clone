import type { JSX } from "react";
import { ErrorBoundary, ErrorFallback } from "@components";
import { useTranslation } from "@i18n";
import { Board } from "../components";
import { useHomeView } from "../providers";

const BoardSection = (): JSX.Element => {
  const { t } = useTranslation();
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
          title={t("home.sections.boardError.title")}
          description={t("home.sections.boardError.description")}
          actionLabel={t("home.sections.boardError.action")}
          onAction={reset}
        />
      )}
    >
      <>
        {showHardModeFinalStretchBar && (
          <div
            role="progressbar"
            aria-label={t("home.sections.insaneCountdownAriaLabel")}
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
              ? t("home.sections.winMessage", { count: guesses.length })
              : t("home.sections.loseMessage", { answer })}
          </p>
        )}
      </>
    </ErrorBoundary>
  );
};

export default BoardSection;
