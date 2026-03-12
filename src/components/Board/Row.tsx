import { Tile } from "./Tile";
import type { RowPropsType } from "./types";

export function Row({ letters, statuses, isLoss = false }: RowPropsType) {
  return (
    <div role="row" className="flex gap-1.5 sm:gap-2">
      {letters.map((letter, index) => (
        <Tile
          key={index}
          letter={letter}
          status={statuses[index]}
          isLoss={isLoss}
        />
      ))}
    </div>
  );
}
