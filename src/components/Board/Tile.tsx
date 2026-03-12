import { STATUS_LABEL, STATUS_STYLE } from "./constant";
import type { TilePropsType } from "./types";

export function Tile({ letter, status, isLoss = false }: TilePropsType) {
  const tileStyle =
    isLoss &&
    (status === "correct" || status === "present" || status === "absent")
      ? STATUS_STYLE.absent
      : STATUS_STYLE[status];

  return (
    <div
      role="gridcell"
      aria-label={`${letter || "blank"}, ${STATUS_LABEL[status]}`}
      className={`flex h-12 w-12 select-none items-center justify-center rounded-xl border-2 text-2xl font-extrabold uppercase transition-colors sm:h-14 sm:w-14 sm:text-[2rem] ${tileStyle}`}
    >
      <p className="times-new-roman">{letter}</p>
    </div>
  );
}
