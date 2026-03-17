export const PROFILE_PAGE_TITLE = "Profile";
export const PROFILE_SETTINGS_TITLE = "Settings";
export const PROFILE_EDIT_ACTION_LABEL = "Edit";
export const PROFILE_CANCEL_ACTION_LABEL = "Cancel";
export const PROFILE_NAME_LABEL = "Name:";
export const PROFILE_SCORE_LABEL = "Score:";
export const PROFILE_SAVE_ACTION_LABEL = "Save";
export const PROFILE_SAVING_ACTION_LABEL = "Saving...";
export const PROFILE_EMPTY_NAME_ERROR_MESSAGE = "Name cannot be empty.";

export const PROFILE_THEME_LABEL = "Theme";
export const PROFILE_THEME_MODE_INPUT_ID = "theme-mode";
export const PROFILE_THEME_MODE_ARIA_LABEL = "Theme mode";
export const PROFILE_THEME_OPTIONS = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
] as const;

export const PROFILE_KEYBOARD_LABEL = "Keyboard";
export const PROFILE_KEYBOARD_MODE_INPUT_ID = "keyboard-mode";
export const PROFILE_KEYBOARD_MODE_ARIA_LABEL = "Keyboard mode";
export const PROFILE_KEYBOARD_OPTIONS = [
  { value: "onscreen", label: "On-screen keyboard" },
  { value: "native", label: "Device keyboard (mobile)" },
] as const;
export const PROFILE_KEYBOARD_MODE_DESCRIPTION =
  "Device keyboard is shown on mobile. Desktop keeps the on-screen keyboard.";

export const PROFILE_DIFFICULTY_LABEL = "Difficulty";
export const PROFILE_DIFFICULTY_MODE_INPUT_ID = "difficulty-mode";
export const PROFILE_DIFFICULTY_MODE_ARIA_LABEL = "Difficulty";
export const PROFILE_DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy" },
  { value: "normal", label: "Normal" },
  { value: "hard", label: "Hard" },
  { value: "insane", label: "Insane" },
] as const;
export const PROFILE_DIFFICULTY_RULES = [
  "Easy shows the word list.",
  "Normal hides the word list.",
  "Hard disables hints.",
  "Insane enables the timer.",
] as const;

export const PROFILE_ANIMATION_ENABLED_LABEL = "Anim: on";
export const PROFILE_ANIMATION_DISABLED_LABEL = "Anim: off";

export const DIFFICULTY_CHANGE_CONFIRMATION_TITLE = "Change difficulty?";
export const DIFFICULTY_CHANGE_CONFIRMATION_DESCRIPTION =
  "You have an active game. If you change the difficulty, your current progress will be lost.";
export const DIFFICULTY_CHANGE_NEW_DIFFICULTY_PREFIX = "New difficulty:";
export const DIFFICULTY_CHANGE_CONFIRM_ACTION_LABEL = "Yes, change and restart";
export const DIFFICULTY_CHANGE_CANCEL_ACTION_LABEL = "Cancel";
export const DIFFICULTY_CHANGE_DIALOG_TITLE_ID =
  "difficulty-change-dialog-title";
