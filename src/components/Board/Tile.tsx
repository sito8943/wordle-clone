import { STATUS_LABEL, STATUS_STYLE } from "./constant";
import type { TilePropsType } from "./types";

export function Tile({ letter, status }: TilePropsType) {
  return (
    <div
      role="gridcell"
      aria-label={`${letter || "blank"}, ${STATUS_LABEL[status]}`}
      className={`flex h-12 w-12 select-none items-center justify-center rounded-xl border-2 text-2xl font-extrabold uppercase transition-colors sm:h-14 sm:w-14 sm:text-[2rem] ${STATUS_STYLE[status]}`}
    >
      <p className="times-new-roman">{letter}</p>
    </div>
  );
}
