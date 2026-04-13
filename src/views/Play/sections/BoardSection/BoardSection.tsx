import { memo, type JSX } from "react";
import { ErrorBoundary, ErrorFallback } from "@components";
import { useTranslation } from "@i18n";
import { usePlayView } from "@views/Play/providers";
import { BoardContent } from "./BoardContent";
import { HardModeProgressBar } from "./HardModeProgressBar";

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
      fallback={() => (
        <ErrorFallback
          title={t("play.sections.boardError.title")}
          description={t("play.sections.boardError.description")}
          actionLabel={t("play.sections.boardError.action")}
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
