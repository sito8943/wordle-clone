import { STATUS_LABEL, STATUS_STYLE, TILE_ENTRY_STAGGER_MS } from "./constants";
import type { TilePropsType } from "./types";

export function Tile({
  letter,
  status,
  animationOrder = 0,
  animateEntry = false,
  isActive = false,
  isLoss = false,
  isHintReveal = false,
  hintRevealPulse = 0,
}: TilePropsType) {
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
      aria-label={`${letter || "blank"}, ${STATUS_LABEL[status]}`}
      className={`relative flex h-12 w-12 select-none items-center justify-center rounded-xl border-2 text-2xl font-extrabold uppercase transition-colors sm:h-14 sm:w-14 sm:text-[2rem] ${tileStyle} ${tileEntryClass}`}
      style={tileEntryStyle}
    >
      {isActive ? (
        <span
          aria-hidden="true"
          className="tile-active-border-animation pointer-events-none absolute inset-0 rounded-lg border-2 border-primary"
        />
      ) : null}
      <p className={`times-new-roman ${letterRevealClass}`}>{letter}</p>
    </div>
  );
}
