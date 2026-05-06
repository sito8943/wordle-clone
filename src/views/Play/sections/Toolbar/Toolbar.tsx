import { memo, type JSX } from "react";
import { FireStreak, Alert } from "@components";
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
    dictionaryLoading,
    dictionaryError,
    challengeCompletionMessage,
  } = controller;
  return (
    <>
      <div className="w-full flex items-center justify-between sm:px-4 toolbar-entry-from-top-animation">
        <FireStreak streak={currentWinStreak} showScoreBonusPopup />
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

export default memo(Toolbar);
