import { memo, type JSX } from "react";
import { ErrorBoundary, ErrorFallback } from "@components";
import { useTranslation } from "@i18n";
import { usePlayView } from "@views/Play/providers";
import { Board } from "../components";
import type { BoardContentProps, HardModeProgressProps } from "./types";

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
    activeTileIndex,
    selectActiveTile,
    manualTileSelection,
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
          activeTileIndex={manualTileSelection ? activeTileIndex : null}
          onTileSelect={manualTileSelection ? selectActiveTile : undefined}
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
  }: HardModeProgressProps): JSX.Element | null => {
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

const BoardSection = (): JSX.Element => {
  const { t } = useTranslation();
  const { controller, animateTileEntry } = usePlayView();
  const {
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
    activeTileIndex,
    selectActiveTile,
    manualTileSelection,
    showHardModeFinalStretchBar,
    hardModeSecondsLeft,
    hardModeFinalStretchProgressPercent,
  } = controller;

  return (
    <ErrorBoundary
      name="play-board"
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
          title={t("play.sections.boardError.title")}
          description={t("play.sections.boardError.description")}
          actionLabel={t("play.sections.boardError.action")}
          onAction={reset}
        />
      )}
    >
      <>
        <HardModeProgressBar
          showHardModeFinalStretchBar={showHardModeFinalStretchBar}
          hardModeSecondsLeft={hardModeSecondsLeft}
          hardModeFinalStretchProgressPercent={
            hardModeFinalStretchProgressPercent
          }
        />
        <BoardContent
          guesses={guesses}
          current={current}
          gameOver={gameOver}
          won={won}
          answer={answer}
          showLegacyEndOfGameMessage={showLegacyEndOfGameMessage}
          startAnimationSeed={startAnimationSeed}
          startAnimationsEnabled={startAnimationsEnabled}
          boardShakePulse={boardShakePulse}
          activeRowHintStatuses={activeRowHintStatuses}
          hintRevealPulse={hintRevealPulse}
          hintRevealTileIndex={hintRevealTileIndex}
          comboFlash={comboFlash}
          normalDictionaryBonusRowFlags={normalDictionaryBonusRowFlags}
          activeTileIndex={activeTileIndex}
          selectActiveTile={selectActiveTile}
          manualTileSelection={manualTileSelection}
          animateTileEntry={animateTileEntry}
        />
      </>
    </ErrorBoundary>
  );
};

export default memo(BoardSection);
