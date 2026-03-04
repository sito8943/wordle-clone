import { Tile } from "./Tile";
import type { RowPropsType } from "./types";

export function Row({ word, statuses, current }: RowPropsType) {
  return (
    <div role="row" className="flex gap-1.5 sm:gap-2">
      {Array.from({ length: 5 }, (_, i) => {
        if (word && statuses) {
          return <Tile key={i} letter={word[i]} status={statuses[i]} />;
        }
        if (current !== undefined) {
          return (
            <Tile
              key={i}
              letter={current[i]}
              status={current[i] ? "tbd" : "empty"}
            />
          );
        }
        return <Tile key={i} status="empty" />;
      })}
    </div>
  );
}
