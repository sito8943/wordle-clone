import { Board } from "@views/Play/components";
import { memo, type JSX } from "react";
import { useTranslation } from "react-i18next";
import type { BoardContentProps } from "./types";

export const BoardContent = memo(
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
