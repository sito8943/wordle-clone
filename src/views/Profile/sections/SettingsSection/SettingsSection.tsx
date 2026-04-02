import { Button } from "@components";
import type { ThemePreference } from "@hooks/useThemePreference";
import { useTranslation } from "@i18n";
import { DifficultySection } from "../DifficultySection";
import {
  PROFILE_END_OF_GAME_DIALOGS_INPUT_ID,
  PROFILE_MANUAL_TILE_SELECTION_INPUT_ID,
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
      language,
      openLanguageDialog,
      keyboardPreference,
      changeKeyboardPreference,
      showEndOfGameDialogs,
      changeShowEndOfGameDialogs,
      manualTileSelection,
      changeManualTileSelection,
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
        <Button onClick={openLanguageDialog} variant="outline" color="neutral">
          {t("profile.languageDialog.openAction", {
            language: t(`profile.languageOptions.${language}`),
          })}
        </Button>
      </div>
      <div id="end-dialogs" className="mt-4 max-w-xl">
        <div className="flex items-start gap-3">
          <input
            id={PROFILE_END_OF_GAME_DIALOGS_INPUT_ID}
            type="checkbox"
            checked={showEndOfGameDialogs}
            onChange={(event) =>
              changeShowEndOfGameDialogs(event.target.checked)
            }
            className="mt-1 h-4 w-4 rounded border-neutral-400 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <label
              htmlFor={PROFILE_END_OF_GAME_DIALOGS_INPUT_ID}
              className="profile-field-label"
            >
              {t("profile.labels.endOfGameDialogs")}
            </label>
            <p className="text-xs text-neutral-600 dark:text-neutral-300">
              {t("profile.endOfGameDialogsDescription")}
            </p>
          </div>
        </div>
      </div>
      <div id="manual-tile-selection" className="mt-4 max-w-xl">
        <div className="flex items-start gap-3">
          <input
            id={PROFILE_MANUAL_TILE_SELECTION_INPUT_ID}
            type="checkbox"
            checked={manualTileSelection}
            onChange={(event) =>
              changeManualTileSelection(event.target.checked)
            }
            className="mt-1 h-4 w-4 rounded border-neutral-400 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <label
              htmlFor={PROFILE_MANUAL_TILE_SELECTION_INPUT_ID}
              className="profile-field-label"
            >
              {t("profile.labels.manualTileSelection")}
            </label>
            <p className="text-xs text-neutral-600 dark:text-neutral-300">
              {t("profile.manualTileSelectionDescription")}
            </p>
          </div>
        </div>
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
