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
  comboFlash = null,
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
  const comboFlashStyleClass =
    comboFlash?.tone === "correct"
      ? "border-green-500 bg-green-500/15 text-green-800 dark:bg-green-500/25 dark:text-green-200"
      : "border-yellow-500 bg-yellow-400/20 text-yellow-900 dark:bg-yellow-500/20 dark:text-yellow-200";

  return (
    <div className={boardWrapperClassName}>
      <div className="relative">
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
        {comboFlash ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 sm:ml-4"
          >
            <span
              key={`combo-${comboFlash.pulse}`}
              className={`combo-flash-animation block rounded-full border px-2.5 py-1 text-sm font-black tracking-wide shadow-lg ${comboFlashStyleClass}`}
            >
              {t("play.gameplay.comboFlashValue", { count: comboFlash.count })}
            </span>
          </span>
        ) : null}
      </div>
    </div>
  );
}
