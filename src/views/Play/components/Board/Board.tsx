import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Row } from "./Row";
import { useTranslation } from "@i18n";
import { cn } from "@utils/cn";
import { NORMAL_DICTIONARY_ROW_BONUS } from "@domain/wordle";
import { PLAY_BOARD_SHARE_CAPTURE_ID } from "@views/Play/constants";
import { BOARD_OVERFLOW_SHIFT_ANIMATION_DURATION_MS } from "./constants";
import type { BoardPropsType, BoardRowViewModel } from "./types";
import useBoardController from "./useBoardController";

export function Board({
  guesses,
  current,
  gameOver,
  enableHorizontalScroll = false,
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
  overflowBufferRows,
  overflowTriggerRemainingRows,
  maxVisibleRows,
}: BoardPropsType) {
  const { t } = useTranslation();
  const { rows, isShaking, rowOffset, isRowWindowed } = useBoardController({
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
    overflowBufferRows,
    overflowTriggerRemainingRows,
    maxVisibleRows,
  });
  const [isOverflowShiftAnimating, setIsOverflowShiftAnimating] =
    useState(false);
  const [overflowShiftRows, setOverflowShiftRows] = useState(0);
  const [overflowAnimationRows, setOverflowAnimationRows] = useState<
    BoardRowViewModel[] | null
  >(null);
  const previousRowsRef = useRef(rows);
  const previousRowOffsetRef = useRef(rowOffset);

  useEffect(() => {
    const previousRowOffset = previousRowOffsetRef.current;
    if (rowOffset === previousRowOffset) {
      previousRowsRef.current = rows;
      return;
    }

    const previousRows = previousRowsRef.current;
    const rowAdvanceCount = rowOffset - previousRowOffset;
    const shouldAnimateOverflowShift =
      isRowWindowed &&
      rowAdvanceCount === 1 &&
      previousRows.length === rows.length;

    if (shouldAnimateOverflowShift) {
      const enteringRows = rows.slice(-rowAdvanceCount);
      setOverflowAnimationRows([...previousRows, ...enteringRows]);
      setOverflowShiftRows(rowAdvanceCount);
      setIsOverflowShiftAnimating(true);
    } else {
      setOverflowAnimationRows(null);
      setOverflowShiftRows(0);
      setIsOverflowShiftAnimating(false);
    }

    previousRowOffsetRef.current = rowOffset;
    previousRowsRef.current = rows;
  }, [isRowWindowed, rowOffset, rows]);

  useEffect(() => {
    if (!isOverflowShiftAnimating) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsOverflowShiftAnimating(false);
      setOverflowShiftRows(0);
      setOverflowAnimationRows(null);
    }, BOARD_OVERFLOW_SHIFT_ANIMATION_DURATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isOverflowShiftAnimating]);

  const boardClassName = cn(
    "space-y-1.5 sm:space-y-2",
    animateEntry && "board-entry-animation",
  );
  const boardWrapperClassName = cn(
    "w-fit",
    isShaking && "board-shake-pulse-animation",
  );
  const boardViewportClassName = isRowWindowed
    ? cn("board-visible-window", isOverflowShiftAnimating && "overflow-hidden")
    : undefined;
  const boardShiftLayerClassName = isOverflowShiftAnimating
    ? "board-overflow-shift-up-animation"
    : undefined;
  const boardShiftLayerStyle = isOverflowShiftAnimating
    ? ({
        "--board-overflow-shift-rows": overflowShiftRows,
      } as CSSProperties)
    : undefined;
  const boardViewportStyle = isRowWindowed
    ? ({
        "--board-visible-rows": rows.length,
      } as CSSProperties)
    : undefined;
  const rowsToRender = overflowAnimationRows ?? rows;
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

  return (
    <div
      data-testid="board-scroll-container"
      className={cn(
        "w-full max-w-full",
        enableHorizontalScroll && "overflow-x-auto overscroll-x-contain",
      )}
    >
      <div className="mx-auto w-fit min-w-max px-4 sm:px-6">
        <div id={PLAY_BOARD_SHARE_CAPTURE_ID} className={boardWrapperClassName}>
          <div className="relative mt-4">
            <div
              data-testid="board-visible-window"
              className={boardViewportClassName}
              style={boardViewportStyle}
            >
              <div
                data-testid="board-row-shift-layer"
                className={boardShiftLayerClassName}
                style={boardShiftLayerStyle}
              >
                <div
                  role="grid"
                  aria-label={t("play.gameplay.boardAriaLabel")}
                  className={boardClassName}
                >
                  {rowsToRender.map((row) => {
                    return (
                      <Row
                        key={row.key}
                        row={row}
                        normalDictionaryBonusTooltip={
                          normalDictionaryBonusTooltip
                        }
                      />
                    );
                  })}
                </div>
              </div>
            </div>
            {comboFlash ? (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 sm:ml-4"
              >
                <span
                  key={`combo-${comboFlash.pulse}`}
                  className={cn(
                    "combo-flash-animation block rounded-full border px-2.5 py-1 text-sm font-black tracking-wide shadow-lg",
                    comboFlashStyleClass,
                  )}
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
