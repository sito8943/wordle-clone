import { type JSX } from "react";
import { FireStreak, Alert } from "@components";
import { ROUTE_SEARCH_PARAMS, ROUTE_SEARCH_PARAM_VALUES } from "@config/routes";
import { WORDLE_MODE_IDS } from "@domain/wordle";
import { useTranslation } from "@i18n";
import { usePlayView } from "@views/Play/providers";
import { useLocation } from "react-router";
import {
  ToolbarWordListButton,
  ToolbarHintButton,
  ToolbarGameplayTourButton,
  ToolbarDailyMeaningButton,
  ToolbarChallengesButton,
  ToolbarResultsButton,
  ToolbarDeveloperConsoleButton,
  ToolbarVolumeButton,
  ToolbarHardModeTimerIndicator,
  ToolbarRefreshButton,
  ToolbarZenFocusButton,
} from "./buttons";

const Toolbar = (): JSX.Element => {
  const { t } = useTranslation();
  const { controller } = usePlayView();
  const location = useLocation();
  const {
    currentWinStreak,
    activeModeId,
    dictionaryLoading,
    dictionaryError,
    challengeCompletionMessage,
  } = controller;
  const searchParams = new URLSearchParams(location.search);
  const zenFocusActive =
    activeModeId === WORDLE_MODE_IDS.ZEN &&
    searchParams.get(ROUTE_SEARCH_PARAMS.FOCUS) ===
      ROUTE_SEARCH_PARAM_VALUES.FOCUS_ON;
  const showStreakBadge = activeModeId !== WORDLE_MODE_IDS.ZEN;
  return (
    <>
      <div
        className={`w-full flex items-center sm:px-4 toolbar-entry-from-top-animation ${
          showStreakBadge ? "justify-between" : "justify-end"
        } transition-[margin-top,translate] duration-500 ease-in-out ${
          zenFocusActive ? "" : "mt-0"
        }`}
      >
        {showStreakBadge ? (
          <div data-tour="streak-badge">
            <FireStreak streak={currentWinStreak} showScoreBonusPopup />
          </div>
        ) : null}
        <div className="flex items-center justify-end gap-2 sm:gap-4">
          {!zenFocusActive ? (
            <>
              <ToolbarWordListButton />
              <ToolbarHintButton />
              <ToolbarGameplayTourButton />
              <ToolbarDailyMeaningButton />
              <ToolbarChallengesButton />
              <ToolbarResultsButton />
              <ToolbarDeveloperConsoleButton />
              <ToolbarVolumeButton />
              <ToolbarHardModeTimerIndicator />
              <ToolbarRefreshButton />
            </>
          ) : null}
          <ToolbarZenFocusButton />
        </div>
      </div>

      {dictionaryLoading && (
        <Alert message={t("play.toolbar.loadingWordList")} color="info" />
      )}

      {!dictionaryLoading && dictionaryError && (
        <Alert message={dictionaryError} color="danger" />
      )}

      {challengeCompletionMessage && (
        <Alert message={challengeCompletionMessage} color="success" />
      )}
    </>
  );
};

export default Toolbar;
