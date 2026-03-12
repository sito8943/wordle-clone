import { Tile } from "./Tile";
import type { RowPropsType } from "./types";

export function Row({
  letters,
  statuses,
  startTileIndex = 0,
  activeTileIndex = null,
  isPastRow = false,
  isActiveRow = false,
  animateTileEntry = false,
  isLoss = false,
}: RowPropsType) {
  const rowScaleClass = isActiveRow
    ? "scale-[1.05]"
    : isPastRow
      ? "scale-[0.95]"
      : "scale-100";

  return (
    <div
      role="row"
      className={`relative flex gap-1.5 sm:gap-2 transition-transform duration-200 ${rowScaleClass}`}
    >
      {isActiveRow ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -left-3 top-1/2 -translate-y-1/2 sm:-left-4"
        >
          <span className="row-active-indicator-animation block h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-primary/25 sm:h-3 sm:w-3" />
        </span>
      ) : null}
      {letters.map((letter, index) => (
        <Tile
          key={index}
          letter={letter}
          status={statuses[index]}
          animationOrder={startTileIndex + index}
          animateEntry={animateTileEntry}
          isActive={activeTileIndex === index}
          isLoss={isLoss}
        />
      ))}
    </div>
  );
}
