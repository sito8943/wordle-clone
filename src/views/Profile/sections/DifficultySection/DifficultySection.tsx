import type {
  PlayerDifficulty,
  PlayerKeyboardPreference,
} from "@domain/wordle";
import type { DifficultySectionProps } from "./types";
import {
  PROFILE_DIFFICULTY_LABEL,
  PROFILE_DIFFICULTY_MODE_ARIA_LABEL,
  PROFILE_DIFFICULTY_MODE_INPUT_ID,
  PROFILE_DIFFICULTY_OPTIONS,
  PROFILE_DIFFICULTY_RULES,
  PROFILE_KEYBOARD_LABEL,
  PROFILE_KEYBOARD_MODE_ARIA_LABEL,
  PROFILE_KEYBOARD_MODE_DESCRIPTION,
  PROFILE_KEYBOARD_MODE_INPUT_ID,
  PROFILE_KEYBOARD_OPTIONS,
} from "@views/Profile/constants";

const DifficultySection = ({
  keyboardPreference,
  onChangeKeyboardPreference,
  difficulty,
  onChangeDifficulty,
}: DifficultySectionProps) => {
  return (
    <div className="max-w-xl">
      <div className="flex flex-col gap-2">
        <label
          htmlFor={PROFILE_KEYBOARD_MODE_INPUT_ID}
          className="profile-field-label"
        >
          {PROFILE_KEYBOARD_LABEL}
        </label>
        <select
          id={PROFILE_KEYBOARD_MODE_INPUT_ID}
          aria-label={PROFILE_KEYBOARD_MODE_ARIA_LABEL}
          value={keyboardPreference}
          onChange={(event) =>
            onChangeKeyboardPreference(
              event.target.value as PlayerKeyboardPreference,
            )
          }
          className="profile-select-input"
        >
          {PROFILE_KEYBOARD_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-neutral-600 dark:text-neutral-300">
          {PROFILE_KEYBOARD_MODE_DESCRIPTION}
        </p>

        <label
          htmlFor={PROFILE_DIFFICULTY_MODE_INPUT_ID}
          className="profile-field-label"
        >
          {PROFILE_DIFFICULTY_LABEL}
        </label>
        <select
          id={PROFILE_DIFFICULTY_MODE_INPUT_ID}
          aria-label={PROFILE_DIFFICULTY_MODE_ARIA_LABEL}
          value={difficulty}
          onChange={(event) =>
            onChangeDifficulty(event.target.value as PlayerDifficulty)
          }
          className="profile-select-input"
        >
          {PROFILE_DIFFICULTY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ul className="list-disc pl-5 text-sm text-neutral-700 dark:text-neutral-300">
          {PROFILE_DIFFICULTY_RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DifficultySection;
