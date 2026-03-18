export const SCOREBOARD_CACHE_KEY = "wordle:scoreboard:cache";
export const SCOREBOARD_PENDING_KEY = "wordle:scoreboard:pending";
export const SCOREBOARD_CLIENT_ID_KEY = "wordle:scoreboard:client-id";

export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 50;

export const ADD_SCORE_MUTATION = "scores:addScore";
export const UPDATE_SCORE_MUTATION = "scores:updateScore";
export const UPSERT_PLAYER_PROFILE_MUTATION = "scores:upsertPlayerProfile";
export const GET_PLAYER_BY_CODE_QUERY = "scores:getPlayerByCode";
export const LIST_TOP_SCORES_QUERY = "scores:listTopScores";
export const IS_NICK_AVAILABLE_QUERY = "scores:isNickAvailable";
export const SCOREBOARD_PROFILE_IDENTITY_KEY =
  "wordle:scoreboard:profile-identity";
