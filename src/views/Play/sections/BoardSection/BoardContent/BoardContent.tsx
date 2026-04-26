import { Board } from "@views/Play/components";
import { WORDLE_MODE_IDS } from "@domain/wordle";
import { usePlayView } from "@views/Play/providers";
import type { JSX } from "react";
import { useTranslation } from "react-i18next";

export const BoardContent = (): JSX.Element => {
  const { t } = useTranslation();
  const { controller, animateTileEntry } = usePlayView();
  const {
    guesses,
    current,
    gameOver,
    roundConfig,
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
  } = controller;

  return (
    <>
      <Board
        key={`board-${startAnimationSeed}`}
        guesses={guesses}
        current={current}
        gameOver={gameOver}
        enableHorizontalScroll={
          controller.activeModeId === WORDLE_MODE_IDS.DAILY
        }
        roundConfig={roundConfig}
        animateTileEntry={animateTileEntry}
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
};
