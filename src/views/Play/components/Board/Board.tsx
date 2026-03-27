import { Row } from "./Row";
import { useTranslation } from "@i18n";
import type { BoardPropsType } from "./types";
import useBoardController from "./useBoardController";

export function Board({
  guesses,
  current,
  gameOver,
  animateEntry = false,
  animateTileEntry = false,
  isLoss = false,
  shakePulse = 0,
  activeRowHintStatuses = {},
  hintRevealPulse = 0,
  hintRevealTileIndex = null,
}: BoardPropsType) {
  const { t } = useTranslation();
  const { rows, isShaking } = useBoardController({
    guesses,
    current,
    gameOver,
    shakePulse,
    activeRowHintStatuses,
    hintRevealTileIndex,
  });
  const boardClassName = `space-y-1.5 sm:space-y-2 mt-4 ${
    animateEntry ? "board-entry-animation" : ""
  }`;
  const boardWrapperClassName = `mx-auto w-fit ${
    isShaking ? "board-shake-pulse-animation" : ""
  }`;

  return (
    <div className={boardWrapperClassName}>
      <div
        role="grid"
        aria-label={t("play.gameplay.boardAriaLabel")}
        className={boardClassName}
      >
        {rows.map((row) => {
          return (
            <Row
              key={row.key}
              letters={row.letters}
              statuses={row.statuses}
              startTileIndex={row.startTileIndex}
              activeTileIndex={row.activeTileIndex}
              isPastRow={row.isPastRow}
              isActiveRow={row.isActiveRow}
              animateTileEntry={animateTileEntry}
              isLoss={isLoss}
              hintRevealPulse={hintRevealPulse}
              hintRevealTileIndex={row.hintRevealTileIndex}
            />
          );
        })}
      </div>
    </div>
  );
}
