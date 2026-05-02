import { Button, SwitcherField } from "@components";
import type { ThemePreference } from "@hooks/useThemePreference";
import { useTranslation } from "@i18n";
import { useFeatureFlags } from "@providers/FeatureFlags";
import { DifficultySection } from "../DifficultySection";
import {
  PROFILE_END_OF_GAME_DIALOGS_INPUT_ID,
  PROFILE_MANUAL_TILE_SELECTION_INPUT_ID,
  PROFILE_SOUND_ENABLED_INPUT_ID,
  PROFILE_THEME_MODE_INPUT_ID,
} from "@views/Profile/constants";
import { useProfileView } from "@views/Profile/providers";

const SettingsSection = () => {
  const { t } = useTranslation();
  const { soundEnabled: soundFeatureEnabled } = useFeatureFlags();
  const {
    controller: {
      startAnimationsEnabled,
      toggleStartAnimations,
      themePreference,
      changeThemePreference,
      language,
      openLanguageDialog,
      showEndOfGameDialogs,
      changeShowEndOfGameDialogs,
      soundEnabled,
      changeSoundEnabled,
      manualTileSelection,
      changeManualTileSelection,
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
        <SwitcherField
          id={PROFILE_END_OF_GAME_DIALOGS_INPUT_ID}
          checked={showEndOfGameDialogs}
          onChange={(event) =>
            changeShowEndOfGameDialogs(event.target.checked)
          }
          label={t("profile.labels.endOfGameDialogs")}
          description={t("profile.endOfGameDialogsDescription")}
        />
      </div>
      {soundFeatureEnabled ? (
        <div id="sound-enabled" className="mt-4 max-w-xl">
          <SwitcherField
            id={PROFILE_SOUND_ENABLED_INPUT_ID}
            checked={soundEnabled}
            onChange={(event) => changeSoundEnabled(event.target.checked)}
            label={t("profile.labels.sound")}
            description={t("profile.soundEnabledDescription")}
          />
        </div>
      ) : null}
      <div id="manual-tile-selection" className="mt-4 max-w-xl">
        <SwitcherField
          id={PROFILE_MANUAL_TILE_SELECTION_INPUT_ID}
          checked={manualTileSelection}
          onChange={(event) =>
            changeManualTileSelection(event.target.checked)
          }
          label={t("profile.labels.manualTileSelection")}
          description={t("profile.manualTileSelectionDescription")}
        />
      </div>
      <DifficultySection />
    </section>
  );
};

export default SettingsSection;
