import { useEffect, type JSX } from "react";
import {
  faChevronLeft,
  faChevronRight,
  faClose,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { PlayerDifficulty } from "@domain/wordle";
import { Button } from "@components";
import { useTranslation } from "@i18n";
import { useFeatureFlags } from "@providers/FeatureFlags";
import {
  PLAY_SETTINGS_PANEL_DIFFICULTY_INPUT_ID,
  PLAY_SETTINGS_PANEL_ID,
  PLAY_SETTINGS_PANEL_MANUAL_TILE_SELECTION_INPUT_ID,
} from "@views/Play/constants";
import { HARD_MODE_TOTAL_SECONDS } from "@views/Play/hooks/usePlayController/constants";
import { usePlayView } from "@views/Play/providers";

const SettingsDrawer = (): JSX.Element | null => {
  const { t } = useTranslation();
  const { wordListButtonEnabled, settingsDrawerEnabled } = useFeatureFlags();
  const { controller, player } = usePlayView();
  const {
    showSettingsPanel,
    openSettingsPanel,
    closeSettingsPanel,
    changeDifficulty,
    changeManualTileSelection,
  } = controller;

  useEffect(() => {
    if (!showSettingsPanel) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      closeSettingsPanel();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeSettingsPanel, showSettingsPanel]);

  const toggleSettingsPanel = () => {
    if (showSettingsPanel) {
      closeSettingsPanel();
      return;
    }

    openSettingsPanel();
  };

  if (!settingsDrawerEnabled) {
    return null;
  }

  return (
    <>
      <div
        className={`dialog-backdrop z-19 transition-opacity duration-500 ease-in-out ${
          showSettingsPanel ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={showSettingsPanel ? closeSettingsPanel : undefined}
      />
      <aside
        id={PLAY_SETTINGS_PANEL_ID}
        role="complementary"
        aria-label={t("play.settingsPanel.title")}
        className={`fixed right-0 top-0 z-19 flex h-full w-full max-w-sm overflow-visible transition-all duration-500 ease-in-out  ${
          showSettingsPanel
            ? "translate-x-0 bg-white border-l border-neutral-300 shadow-2xl dark:border-neutral-700 dark:bg-neutral-900"
            : "pointer-events-none translate-x-[90%]"
        }`}
      >
        <Button
          onClick={toggleSettingsPanel}
          aria-label={t("play.toolbar.settingsAriaLabel")}
          aria-expanded={showSettingsPanel}
          aria-controls={PLAY_SETTINGS_PANEL_ID}
          icon={!showSettingsPanel ? faChevronLeft : faChevronRight}
          iconClassName={`text-base transition-transform duration-300 ease-out`}
          variant="ghost"
          className={`h-full pointer-events-auto ${showSettingsPanel ? "w-6 max-sm:hidden!" : "w-10 h-full max-h-60 my-auto"}`}
        />
        <div className={showSettingsPanel ? "" : "pointer-events-none"}>
          <header className="relative border-b border-neutral-200 px-4 py-4 dark:border-neutral-700">
            <div className="pr-10">
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                {t("play.settingsPanel.title")}
              </h2>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                {t("play.settingsPanel.description")}
              </p>
            </div>
            <Button
              onClick={closeSettingsPanel}
              variant="ghost"
              color="danger"
              className="absolute right-2 top-2"
              aria-label={t("common.close")}
            >
              <FontAwesomeIcon icon={faClose} />
            </Button>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor={PLAY_SETTINGS_PANEL_DIFFICULTY_INPUT_ID}
                  className="profile-field-label"
                >
                  {t("profile.labels.difficulty")}
                </label>
                <select
                  id={PLAY_SETTINGS_PANEL_DIFFICULTY_INPUT_ID}
                  aria-label={t("profile.labels.difficulty")}
                  value={player.difficulty}
                  onChange={(event) =>
                    changeDifficulty(event.target.value as PlayerDifficulty)
                  }
                  className="profile-select-input w-full"
                >
                  <option value="easy">
                    {t("profile.difficultyOptions.easy")}
                  </option>
                  <option value="normal">
                    {t("profile.difficultyOptions.normal")}
                  </option>
                  <option value="hard">
                    {t("profile.difficultyOptions.hard")}
                  </option>
                  <option value="insane">
                    {t("profile.difficultyOptions.insane")}
                  </option>
                </select>
                <ul className="list-disc pl-5 text-sm text-neutral-700 dark:text-neutral-300">
                  <li>
                    {wordListButtonEnabled
                      ? t("profile.difficultyRules.easy")
                      : t("profile.difficultyRules.easyNoWordList")}
                  </li>
                  <li>
                    {wordListButtonEnabled
                      ? t("profile.difficultyRules.normal")
                      : t("profile.difficultyRules.normalNoWordList")}
                  </li>
                  <li>{t("profile.difficultyRules.hard")}</li>
                  <li>
                    {t("profile.difficultyRules.insane", {
                      seconds: HARD_MODE_TOTAL_SECONDS,
                    })}
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                <div className="flex items-start gap-3">
                  <input
                    id={PLAY_SETTINGS_PANEL_MANUAL_TILE_SELECTION_INPUT_ID}
                    type="checkbox"
                    checked={player.manualTileSelection}
                    onChange={(event) =>
                      changeManualTileSelection(event.target.checked)
                    }
                    className="mt-1 h-4 w-4 rounded border-neutral-400 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <label
                      htmlFor={
                        PLAY_SETTINGS_PANEL_MANUAL_TILE_SELECTION_INPUT_ID
                      }
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
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SettingsDrawer;
