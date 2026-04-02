import { memo, type JSX } from "react";
import { ErrorBoundary, ErrorFallback } from "@components";
import { useTranslation } from "@i18n";
import { Board } from "../components";
import type { BoardContentProps, BoardSectionProps } from "./types";

const BoardContent = memo(
  ({
    guesses,
    current,
    gameOver,
    won,
    answer,
    showLegacyEndOfGameMessage,
    startAnimationSeed,
    startAnimationsEnabled,
    boardShakePulse,
    activeRowHintStatuses,
    hintRevealPulse,
    hintRevealTileIndex,
    comboFlash,
    normalDictionaryBonusRowFlags,
    animateTileEntry,
  }: BoardContentProps): JSX.Element => {
    const { t } = useTranslation();

    return (
      <>
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
          comboFlash={comboFlash}
          normalDictionaryBonusRowFlags={normalDictionaryBonusRowFlags}
        />

        {gameOver && showLegacyEndOfGameMessage && (
          <p className="text-center text-base font-semibold text-neutral-800 dark:text-neutral-200 sm:text-lg">
            {won
              ? t("play.sections.winMessage", { count: guesses.length })
              : t("play.sections.loseMessage", { answer })}
          </p>
        )}
      </>
    );
  },
);

const HardModeProgressBar = memo(
  ({
    showHardModeFinalStretchBar,
    hardModeSecondsLeft,
    hardModeFinalStretchProgressPercent,
  }: BoardSectionProps["hardModeProgress"]): JSX.Element | null => {
    const { t } = useTranslation();

    if (!showHardModeFinalStretchBar) {
      return null;
    }

    return (
      <div
        role="progressbar"
        aria-label={t("play.sections.insaneCountdownAriaLabel")}
        aria-valuemin={0}
        aria-valuemax={15}
        aria-valuenow={hardModeSecondsLeft}
        className="w-full max-w-md"
      >
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-blue-200/80 dark:bg-blue-950/50">
          <div
            className="h-full origin-left rounded-full bg-blue-500 transition-transform duration-1000 ease-linear dark:bg-blue-400"
            style={{
              transform: `scaleX(${hardModeFinalStretchProgressPercent / 100})`,
            }}
          />
        </div>
      </div>
    );
  },
);

const BoardSection = ({
  board,
  hardModeProgress,
}: BoardSectionProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <ErrorBoundary
      name="play-board"
      resetKeys={[
        board.guesses.length,
        board.current,
        board.gameOver,
        board.won,
        board.startAnimationSeed,
        board.boardShakePulse,
      ]}
      fallback={({ reset }) => (
        <ErrorFallback
          title={t("play.sections.boardError.title")}
          description={t("play.sections.boardError.description")}
          actionLabel={t("play.sections.boardError.action")}
          onAction={reset}
        />
      )}
    >
      <>
        <HardModeProgressBar
          showHardModeFinalStretchBar={hardModeProgress.showHardModeFinalStretchBar}
          hardModeSecondsLeft={hardModeProgress.hardModeSecondsLeft}
          hardModeFinalStretchProgressPercent={
            hardModeProgress.hardModeFinalStretchProgressPercent
          }
        />
        <BoardContent
          guesses={board.guesses}
          current={board.current}
          gameOver={board.gameOver}
          won={board.won}
          answer={board.answer}
          showLegacyEndOfGameMessage={board.showLegacyEndOfGameMessage}
          startAnimationSeed={board.startAnimationSeed}
          startAnimationsEnabled={board.startAnimationsEnabled}
          boardShakePulse={board.boardShakePulse}
          activeRowHintStatuses={board.activeRowHintStatuses}
          hintRevealPulse={board.hintRevealPulse}
          hintRevealTileIndex={board.hintRevealTileIndex}
          comboFlash={board.comboFlash}
          normalDictionaryBonusRowFlags={board.normalDictionaryBonusRowFlags}
          animateTileEntry={board.animateTileEntry}
        />
      </>
    </ErrorBoundary>
  );
};

export default memo(BoardSection);
