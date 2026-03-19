import { Button } from "@components";
import type { ThemePreference } from "@hooks/useThemePreference";
import { useTranslation } from "@i18n";
import { DifficultySection } from "../DifficultySection";
import {
  PROFILE_THEME_MODE_INPUT_ID,
} from "@views/Profile/constants";
import { useProfileView } from "@views/Profile/providers";

const SettingsSection = () => {
  const { t } = useTranslation();
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
      <h2 className="profile-section-title">{t("profile.settingsTitle")}</h2>
      <div className="flex gap-4 items-center flex-wrap">
        <Button
          onClick={toggleStartAnimations}
          variant="outline"
          color="neutral"
        >
          {startAnimationsEnabled
            ? t("profile.animationEnabled")
            : t("profile.animationDisabled")}
        </Button>
        <label
          htmlFor={PROFILE_THEME_MODE_INPUT_ID}
          className="text-sm font-semibold"
        >
          {t("profile.labels.theme")}
        </label>
        <select
          id={PROFILE_THEME_MODE_INPUT_ID}
          aria-label={t("profile.labels.themeMode")}
          value={themePreference}
          onChange={(event) =>
            changeThemePreference(event.target.value as ThemePreference)
          }
        >
          <option value="system">{t("profile.themeOptions.system")}</option>
          <option value="light">{t("profile.themeOptions.light")}</option>
          <option value="dark">{t("profile.themeOptions.dark")}</option>
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
