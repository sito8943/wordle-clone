import type {
  PlayerDifficulty,
  PlayerKeyboardPreference,
} from "@domain/wordle";
import { useTranslation } from "@i18n";
import { useFeatureFlags } from "@providers/FeatureFlags";
import {
  PROFILE_DIFFICULTY_MODE_INPUT_ID,
  PROFILE_KEYBOARD_MODE_INPUT_ID,
} from "@views/Profile/constants";
import { useProfileView } from "@views/Profile/providers";
import { HARD_MODE_TOTAL_SECONDS } from "@views/Play/hooks/usePlayController/constants";

const DifficultySection = () => {
  const {
    controller: {
      keyboardPreference,
      changeKeyboardPreference,
      difficulty,
      changeDifficulty,
    },
  } = useProfileView();
  const { t } = useTranslation();
  const {
    wordListButtonEnabled,
    difficultyEasyEnabled,
    difficultyNormalEnabled,
    difficultyHardEnabled,
    difficultyInsaneEnabled,
  } = useFeatureFlags();

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
            changeKeyboardPreference(
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
            changeDifficulty(event.target.value as PlayerDifficulty)
          }
          className="profile-select-input"
        >
          {difficultyEasyEnabled && (
            <option value="easy">{t("profile.difficultyOptions.easy")}</option>
          )}
          {difficultyNormalEnabled && (
            <option value="normal">
              {t("profile.difficultyOptions.normal")}
            </option>
          )}
          {difficultyHardEnabled && (
            <option value="hard">{t("profile.difficultyOptions.hard")}</option>
          )}
          {difficultyInsaneEnabled && (
            <option value="insane">
              {t("profile.difficultyOptions.insane")}
            </option>
          )}
        </select>
        <ul className="list-disc pl-5 text-sm text-neutral-700 dark:text-neutral-300">
          {difficultyEasyEnabled && (
            <li>
              {wordListButtonEnabled
                ? t("profile.difficultyRules.easy")
                : t("profile.difficultyRules.easyNoWordList")}
            </li>
          )}
          {difficultyNormalEnabled && (
            <li>
              {wordListButtonEnabled
                ? t("profile.difficultyRules.normal")
                : t("profile.difficultyRules.normalNoWordList")}
            </li>
          )}
          {difficultyHardEnabled && (
            <li>{t("profile.difficultyRules.hard")}</li>
          )}
          {difficultyInsaneEnabled && (
            <li>
              {t("profile.difficultyRules.insane", {
                seconds: HARD_MODE_TOTAL_SECONDS,
              })}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default DifficultySection;
