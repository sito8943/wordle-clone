import { memo, useState, type JSX } from "react";
import {
  faLightbulb,
  faList,
  faRotateRight,
  faSquarePollHorizontal,
  faTrophy,
} from "@fortawesome/free-solid-svg-icons";
import { Button, FireStreak, Alert } from "@components";
import { useTranslation } from "@i18n";
import { useFeatureFlags } from "@providers/FeatureFlags";
import { useSound } from "@providers/Sound";
import { usePlayView } from "@views/Play/providers";
import VolumeDialog from "@views/Play/components/Dialogs/VolumeDialog/VolumeDialog";
import { getToolbarVolumeIcon } from "./utils";
import { HardModeTimerIndicator } from "./HardModeTimerIndicator";
import type { NativeKeyboardClockStyle } from "./types";

const Toolbar = (): JSX.Element => {
  const { t } = useTranslation();
  const { hintsEnabled, soundEnabled: soundFeatureEnabled } = useFeatureFlags();
  const { volume, muted } = useSound();
  const toolbarIconClassName = "text-lg toolbar-icon-entry-animation";
  const [showVolumeDialog, setShowVolumeDialog] = useState(false);
  const {
    controller,
    wordListButtonEnabled,
    developerConsoleEnabled,
    challengesEnabled,
    challenges,
  } = usePlayView();
  const {
    currentWinStreak,
    dictionaryLoading,
    dictionaryWords,
    openWordsDialog,
    hintsEnabledForDifficulty,
    useHint,
    hintButtonDisabled,
    hintsRemaining,
    canReopenEndOfGameDialog,
    reopenEndOfGameDialog,
    openDeveloperConsoleDialog,
    showRefreshAttention,
    refreshAttentionPulse,
    refreshAttentionScale,
    refreshBoard,
    dictionaryError,
    challengeCompletionMessage,
    showHardModeTimer,
    hardModeSecondsLeft,
    hardModeTickPulse,
    hardModeClockBoostScale,
  } = controller;

  return (
    <>
      <div className="w-full flex items-center justify-between sm:px-4 toolbar-icon-entry-animation">
        <FireStreak streak={currentWinStreak} />
        <div className="flex items-center justify-end gap-2 sm:gap-4 ">
          {wordListButtonEnabled && (
            <Button
              onClick={openWordsDialog}
              aria-label={t("play.toolbar.wordListAriaLabel")}
              variant="ghost"
              icon={faList}
              iconClassName={toolbarIconClassName}
              className="mobile-compact-button"
              hideLabelOnMobile
              disabled={dictionaryLoading || dictionaryWords.length === 0}
            >
              {t("play.toolbar.wordListButton")}
            </Button>
          )}
          {hintsEnabled && hintsEnabledForDifficulty && (
            <Button
              onClick={useHint}
              aria-label={t("play.toolbar.hintAriaLabel")}
              variant="ghost"
              color={!hintButtonDisabled ? "primary" : "secondary"}
              icon={faLightbulb}
              iconClassName={toolbarIconClassName}
              className="mobile-compact-button"
              hideLabelOnMobile
              disabled={hintButtonDisabled}
            >
              {t("play.toolbar.hintButton", { count: hintsRemaining })}
            </Button>
          )}
          {challengesEnabled &&
            challenges.challenges &&
            (() => {
              const completedIds = new Set(
                challenges.progress
                  .filter((p) => p.completed)
                  .map((p) => p.challengeId),
              );
              const allChallengesCompleted =
                completedIds.has(challenges.challenges.simple.id) &&
                completedIds.has(challenges.challenges.complex.id);

              return (
                <Button
                  onClick={challenges.openDialog}
                  aria-label={t("challenges.buttonAriaLabel")}
                  variant="ghost"
                  color={allChallengesCompleted ? "neutral" : "primary"}
                  icon={faTrophy}
                  iconClassName={toolbarIconClassName}
                  className={
                    allChallengesCompleted
                      ? "mobile-compact-button opacity-50"
                      : "mobile-compact-button"
                  }
                  hideLabelOnMobile
                >
                  {t("challenges.buttonLabel")}
                </Button>
              );
            })()}
          {canReopenEndOfGameDialog ? (
            <Button
              onClick={reopenEndOfGameDialog}
              aria-label={t("play.toolbar.resultsAriaLabel")}
              variant="ghost"
              icon={faSquarePollHorizontal}
              iconClassName={toolbarIconClassName}
              hideLabelOnMobile
              className="mobile-compact-button"
            >
              {t("play.toolbar.resultsButton")}
            </Button>
          ) : null}
          {developerConsoleEnabled && (
            <Button
              onClick={openDeveloperConsoleDialog}
              aria-label={t("play.toolbar.developerConsoleAriaLabel")}
              variant="solid"
              color="danger"
              iconClassName="text-lg"
              className="mobile-compact-button fixed bottom-40 right-2"
            >
              {t("play.toolbar.developerConsoleButton")}
            </Button>
          )}
          {soundFeatureEnabled && (
            <Button
              onClick={() => setShowVolumeDialog(true)}
              aria-label={t("play.toolbar.volumeAriaLabel")}
              variant="ghost"
              icon={getToolbarVolumeIcon(volume, muted)}
              iconClassName={toolbarIconClassName}
              className="mobile-compact-button"
              hideLabelOnMobile
            >
              {t("play.toolbar.volumeAriaLabel")}
            </Button>
          )}
          <HardModeTimerIndicator
            showHardModeTimer={showHardModeTimer}
            hardModeSecondsLeft={hardModeSecondsLeft}
            hardModeTickPulse={hardModeTickPulse}
            hardModeClockBoostScale={hardModeClockBoostScale}
          />
          <span
            key={showRefreshAttention ? refreshAttentionPulse : "idle"}
            className={
              showRefreshAttention
                ? "boost-animation inline-flex"
                : "inline-flex"
            }
            style={
              showRefreshAttention
                ? ({
                    "--boost-scale": refreshAttentionScale.toString(),
                  } as NativeKeyboardClockStyle)
                : undefined
            }
          >
            <Button
              onClick={refreshBoard}
              aria-label={t("play.toolbar.refreshAriaLabel")}
              data-wordle-refresh="true"
              icon={faRotateRight}
              variant="ghost"
              iconClassName={toolbarIconClassName}
              className={
                showRefreshAttention
                  ? "mobile-compact-button text-amber-700 dark:text-amber-300"
                  : "mobile-compact-button"
              }
              hideLabelOnMobile
            >
              {t("common.refresh")}
            </Button>
          </span>
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

      {showVolumeDialog && (
        <VolumeDialog visible onClose={() => setShowVolumeDialog(false)} />
      )}
    </>
  );
};

export default memo(Toolbar);
