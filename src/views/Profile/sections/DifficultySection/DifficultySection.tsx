import type {
  PlayerDifficulty,
  PlayerKeyboardPreference,
} from "@domain/wordle";
import { useTranslation } from "@i18n";
import type { DifficultySectionProps } from "./types";
import {
  PROFILE_DIFFICULTY_MODE_INPUT_ID,
  PROFILE_KEYBOARD_MODE_INPUT_ID,
} from "@views/Profile/constants";

const DifficultySection = ({
  keyboardPreference,
  onChangeKeyboardPreference,
  difficulty,
  onChangeDifficulty,
}: DifficultySectionProps) => {
  const { t } = useTranslation();

  return (
    <div className="max-w-xl" id="difficulty">
      <div className="flex flex-col gap-2">
        <label
          htmlFor={PROFILE_KEYBOARD_MODE_INPUT_ID}
          className="profile-field-label"
        >
          {t("profile.labels.keyboard")}
        </label>
        <select
          id={PROFILE_KEYBOARD_MODE_INPUT_ID}
          aria-label={t("profile.labels.keyboardMode")}
          value={keyboardPreference}
          onChange={(event) =>
            onChangeKeyboardPreference(
              event.target.value as PlayerKeyboardPreference,
            )
          }
          className="profile-select-input"
        >
          <option value="onscreen">
            {t("profile.keyboardOptions.onscreen")}
          </option>
          <option value="native">{t("profile.keyboardOptions.native")}</option>
        </select>
        <p className="text-xs text-neutral-600 dark:text-neutral-300">
          {t("profile.keyboardDescription")}
        </p>

        <label
          htmlFor={PROFILE_DIFFICULTY_MODE_INPUT_ID}
          className="profile-field-label"
        >
          {t("profile.labels.difficulty")}
        </label>
        <select
          id={PROFILE_DIFFICULTY_MODE_INPUT_ID}
          aria-label={t("profile.labels.difficulty")}
          value={difficulty}
          onChange={(event) =>
            onChangeDifficulty(event.target.value as PlayerDifficulty)
          }
          className="profile-select-input"
        >
          <option value="easy">{t("profile.difficultyOptions.easy")}</option>
          <option value="normal">
            {t("profile.difficultyOptions.normal")}
          </option>
          <option value="hard">{t("profile.difficultyOptions.hard")}</option>
          <option value="insane">
            {t("profile.difficultyOptions.insane")}
          </option>
        </select>
        <ul className="list-disc pl-5 text-sm text-neutral-700 dark:text-neutral-300">
          <li>{t("profile.difficultyRules.easy")}</li>
          <li>{t("profile.difficultyRules.normal")}</li>
          <li>{t("profile.difficultyRules.hard")}</li>
          <li>{t("profile.difficultyRules.insane")}</li>
        </ul>
      </div>
    </div>
  );
};

export default DifficultySection;
