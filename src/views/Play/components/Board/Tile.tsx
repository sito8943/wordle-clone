import { useTranslation } from "@i18n";
import { STATUS_STYLE, TILE_ENTRY_STAGGER_MS } from "./constants";
import type { TilePropsType } from "./types";

export function Tile({ tile }: TilePropsType) {
  const {
    letter,
    status,
    animationOrder,
    animateEntry,
    isActive,
    isLoss,
    isHintReveal,
    hintRevealPulse,
  } = tile;
  const { t } = useTranslation();
  const tileStyle =
    isLoss &&
    (status === "correct" || status === "present" || status === "absent")
      ? STATUS_STYLE.absent
      : STATUS_STYLE[status];
  const tileEntryClass = animateEntry ? "tile-entry-animation" : "";
  const tileEntryStyle = animateEntry
    ? { animationDelay: `${animationOrder * TILE_ENTRY_STAGGER_MS}ms` }
    : undefined;
  const letterRevealClass =
    isHintReveal && hintRevealPulse > 0 ? "tile-hint-reveal-animation" : "";
  return (
    <div
      role="gridcell"
      aria-label={`${letter || t("play.gameplay.tile.blank")}, ${t(
        `play.gameplay.tile.statuses.${status}`,
      )}`}
      className={`relative flex h-12 w-12 select-none items-center justify-center rounded-xl border-2 text-2xl font-extrabold uppercase transition-colors sm:h-14 sm:w-14 sm:text-[2rem] ${tileStyle} ${tileEntryClass}`}
      style={tileEntryStyle}
    >
      {isActive ? (
        <span
          aria-hidden="true"
          className="tile-active-border-animation pointer-events-none absolute inset-0 rounded-lg border-2 border-primary"
        />
      ) : null}
      <p className={`slab ${letterRevealClass}`}>{letter}</p>
    </div>
  );
}
