import { Row } from "./Row";
import { useTranslation } from "@i18n";
import { NORMAL_DICTIONARY_ROW_BONUS, WORDLE_MODE_IDS } from "@domain/wordle";
import { PLAY_BOARD_SHARE_CAPTURE_ID } from "@views/Play/constants";
import type { BoardPropsType } from "./types";
import useBoardController from "./useBoardController";
import { usePlayView } from "@views/Play/providers";

export function Board({
  guesses,
  current,
  gameOver,
  roundConfig,
  animateEntry = false,
  animateTileEntry = false,
  shakePulse = 0,
  activeRowHintStatuses = {},
  hintRevealPulse = 0,
  hintRevealTileIndex = null,
  comboFlash = null,
  normalDictionaryBonusRowFlags = [],
  activeTileIndex = null,
  onTileSelect,
}: BoardPropsType) {
  const { t } = useTranslation();
  const { rows, isShaking } = useBoardController({
    guesses,
    current,
    gameOver,
    roundConfig,
    animateTileEntry,
    shakePulse,
    hintRevealPulse,
    activeRowHintStatuses,
    hintRevealTileIndex,
    normalDictionaryBonusRowFlags,
    activeTileIndex,
    onTileSelect,
  });
  const boardClassName = `space-y-1.5 sm:space-y-2 mt-4 ${
    animateEntry ? "board-entry-animation" : ""
  }`;
  const boardWrapperClassName = `w-fit ${
    isShaking ? "board-shake-pulse-animation" : ""
  }`;
  const comboFlashStyleClass =
    comboFlash?.tone === "correct"
      ? "border-green-500 bg-green-500/15 text-green-800 dark:bg-green-500/25 dark:text-green-200"
      : "border-yellow-500 bg-yellow-400/20 text-yellow-900 dark:bg-yellow-500/20 dark:text-yellow-200";
  const normalDictionaryBonusTooltip = t(
    "play.gameplay.normalDictionaryBonusTooltip",
    {
      bonus: NORMAL_DICTIONARY_ROW_BONUS,
    },
  );

  const { controller } = usePlayView();
  const { activeModeId } = controller;

  return (
    <div
      data-testid="board-scroll-container"
      className={`w-full max-w-full ${activeModeId === WORDLE_MODE_IDS.DAILY ? "overflow-x-auto overscroll-x-contain" : ""}`}
    >
      <div className="mx-auto w-fit min-w-max px-4 sm:px-6">
        <div id={PLAY_BOARD_SHARE_CAPTURE_ID} className={boardWrapperClassName}>
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
                    row={row}
                    normalDictionaryBonusTooltip={normalDictionaryBonusTooltip}
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
                  {t("play.gameplay.comboFlashValue", {
                    count: comboFlash.count,
                  })}
                </span>
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
