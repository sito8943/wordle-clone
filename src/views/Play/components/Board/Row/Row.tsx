import { Tile } from "./Tile";
import type { RowPropsType } from "./types";

export function Row({ row, normalDictionaryBonusTooltip }: RowPropsType) {
  const rowScaleClass = row.isActiveRow
    ? "scale-[1.05]"
    : row.isPastRow
      ? "scale-[0.95]"
      : "scale-100";

  return (
    <div
      role="row"
      className={`relative flex gap-1.5 sm:gap-2 transition-[scale] duration-200 ${rowScaleClass}`}
    >
      {row.isActiveRow ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -left-3 top-1/2 -translate-y-1/2 sm:-left-4"
        >
          <span className="row-active-indicator-animation block h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-primary/25 sm:h-3 sm:w-3" />
        </span>
      ) : null}
      {row.showNormalDictionaryBonusIndicator ? (
        <span
          role="img"
          aria-label={normalDictionaryBonusTooltip}
          title={normalDictionaryBonusTooltip}
          className="absolute -right-3 top-1/2 -translate-y-1/2 sm:-right-4"
        >
          <span className="block h-2.5 w-2.5 rounded-full border border-neutral-400 bg-transparent sm:h-3 sm:w-3 dark:border-neutral-500" />
        </span>
      ) : null}
      {row.tiles.map((tile) => (
        <Tile key={tile.key} tile={tile} />
      ))}
    </div>
  );
}
