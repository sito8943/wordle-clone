import { CLASSIC_ROUND_CONFIG } from "../roundConfig";

export const BOARD_ROWS = CLASSIC_ROUND_CONFIG.maxGuesses;
export const BOARD_COLUMNS = CLASSIC_ROUND_CONFIG.lettersPerRow;
export const BOARD_OVERFLOW_BUFFER_ROWS = 2;
export const BOARD_OVERFLOW_TRIGGER_REMAINING_ROWS = 2;
