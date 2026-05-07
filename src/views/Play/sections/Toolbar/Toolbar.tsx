import { type JSX } from "react";
import { FireStreak, Alert } from "@components";
import { WORDLE_MODE_IDS } from "@domain/wordle";
import { useTranslation } from "@i18n";
import { usePlayView } from "@views/Play/providers";
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
} from "./buttons";

const Toolbar = (): JSX.Element => {
  const { t } = useTranslation();
  const { controller } = usePlayView();
  const {
    currentWinStreak,
    activeModeId,
    dictionaryLoading,
    dictionaryError,
    challengeCompletionMessage,
  } = controller;
  const showStreakBadge = activeModeId !== WORDLE_MODE_IDS.ZEN;
  return (
    <>
      <div
        className={`w-full flex items-center sm:px-4 toolbar-entry-from-top-animation ${
          showStreakBadge ? "justify-between" : "justify-end"
        }`}
      >
        {showStreakBadge ? (
          <div data-tour="streak-badge">
            <FireStreak streak={currentWinStreak} showScoreBonusPopup />
          </div>
        ) : null}
        <div className="flex items-center justify-end gap-2 sm:gap-4 ">
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
