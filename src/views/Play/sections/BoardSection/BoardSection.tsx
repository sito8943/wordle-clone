import { memo, type JSX } from "react";
import { ErrorBoundary, ErrorFallback } from "@components";
import { useTranslation } from "@i18n";
import { usePlayView } from "@views/Play/providers";
import { BoardContent } from "./BoardContent";
import { HardModeProgressBar } from "./HardModeProgressBar";

const BoardSection = (): JSX.Element => {
  const { t } = useTranslation();
  const { controller } = usePlayView();
  const {
    guesses,
    current,
    gameOver,
    won,
    startAnimationSeed,
    boardShakePulse,
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
        <BoardContent />
      </>
    </ErrorBoundary>
  );
};

export default memo(BoardSection);
