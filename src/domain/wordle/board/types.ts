export type BoardCellStatus =
  | "correct"
  | "present"
  | "absent"
  | "empty"
  | "tbd";

export type BoardRowModel = {
  letters: string[];
  statuses: BoardCellStatus[];
};
