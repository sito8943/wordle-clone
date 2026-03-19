export const SCOREBOARD_CACHE_KEY = "wordle:scoreboard:cache";
export const SCOREBOARD_PENDING_KEY = "wordle:scoreboard:pending";
export const SCOREBOARD_CLIENT_ID_KEY = "wordle:scoreboard:client-id";
export const WORDLE_SYNC_EVENTS_KEY = "wordle:sync-events";

export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 50;

export const ADD_SCORE_MUTATION = "scores:addScore";
export const UPDATE_SCORE_MUTATION = "scores:updateScore";
export const UPSERT_PLAYER_PROFILE_MUTATION = "scores:upsertPlayerProfile";
export const SYNC_VICTORY_EVENTS_MUTATION = "scores:syncVictoryEvents";
export const GET_PLAYER_BY_CODE_QUERY = "scores:getPlayerByCode";
export const GET_CURRENT_PLAYER_PROFILE_QUERY =
  "scores:getCurrentPlayerProfile";
export const LIST_TOP_SCORES_QUERY = "scores:listTopScores";
export const IS_NICK_AVAILABLE_QUERY = "scores:isNickAvailable";
export const SCOREBOARD_PROFILE_IDENTITY_KEY =
  "wordle:scoreboard:profile-identity";
