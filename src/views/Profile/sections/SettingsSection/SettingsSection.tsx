import { Button } from "@components";
import type { ThemePreference } from "@hooks/useThemePreference";
import { DifficultySection } from "../DifficultySection";
import {
  PROFILE_SETTINGS_TITLE,
  PROFILE_ANIMATION_ENABLED_LABEL,
  PROFILE_ANIMATION_DISABLED_LABEL,
  PROFILE_THEME_MODE_INPUT_ID,
  PROFILE_THEME_LABEL,
  PROFILE_THEME_MODE_ARIA_LABEL,
  PROFILE_THEME_OPTIONS,
} from "@views/Profile/constants";
import { useProfileView } from "@views/Profile/providers";

const SettingsSection = () => {
  const {
    controller: {
      startAnimationsEnabled,
      toggleStartAnimations,
      themePreference,
      changeThemePreference,
      keyboardPreference,
      changeKeyboardPreference,
      difficulty,
      changeDifficulty,
    },
  } = useProfileView();

  return (
    <section id="settings" className="profile-section">
      <h2 className="profile-section-title">{PROFILE_SETTINGS_TITLE}</h2>
      <div className="flex gap-4 items-center flex-wrap">
        <Button
          onClick={toggleStartAnimations}
          variant="outline"
          color="neutral"
        >
          {startAnimationsEnabled
            ? PROFILE_ANIMATION_ENABLED_LABEL
            : PROFILE_ANIMATION_DISABLED_LABEL}
        </Button>
        <label
          htmlFor={PROFILE_THEME_MODE_INPUT_ID}
          className="text-sm font-semibold"
        >
          {PROFILE_THEME_LABEL}
        </label>
        <select
          id={PROFILE_THEME_MODE_INPUT_ID}
          aria-label={PROFILE_THEME_MODE_ARIA_LABEL}
          value={themePreference}
          onChange={(event) =>
            changeThemePreference(event.target.value as ThemePreference)
          }
        >
          {PROFILE_THEME_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <DifficultySection
        keyboardPreference={keyboardPreference}
        onChangeKeyboardPreference={changeKeyboardPreference}
        difficulty={difficulty}
        onChangeDifficulty={changeDifficulty}
      />
    </section>
  );
};

export default SettingsSection;
