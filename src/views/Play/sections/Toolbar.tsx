import { memo, useState, type JSX } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleQuestion,
  faClock,
  faLightbulb,
  faList,
  faRotateRight,
  faSquarePollHorizontal,
  faTrophy,
  faVolumeHigh,
  faVolumeLow,
  faVolumeOff,
  faVolumeXmark,
} from "@fortawesome/free-solid-svg-icons";
import { Button, FireStreak, Alert } from "@components";
import { useTranslation } from "@i18n";
import { useFeatureFlags } from "@providers/FeatureFlags";
import { useSound } from "@providers/Sound";
import { usePlayView } from "@views/Play/providers";
import VolumeDialog from "@views/Play/components/Dialogs/VolumeDialog/VolumeDialog";
import type { NativeKeyboardClockStyle, ToolbarTimerProps } from "./types";

const getToolbarVolumeIcon = (volume: number, muted: boolean) => {
  if (muted) return faVolumeXmark;
  if (volume === 0) return faVolumeOff;
  if (volume < 50) return faVolumeLow;
  return faVolumeHigh;
};

const HardModeTimerIndicator = memo(
  ({
    showHardModeTimer,
    hardModeSecondsLeft,
    hardModeTickPulse,
    hardModeClockBoostScale,
  }: ToolbarTimerProps): JSX.Element | null => {
    const { t } = useTranslation();

    if (!showHardModeTimer) {
      return null;
    }

    return (
      <div
        role="status"
        aria-live="polite"
        aria-label={t("play.toolbar.insaneTimerAriaLabel", {
          seconds: hardModeSecondsLeft,
        })}
        className="mobile-compact-button inline-flex items-center gap-2 rounded border px-3 py-2 text-sm font-bold border-blue-300 bg-blue-100/90 text-blue-900 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-200"
      >
        <span
          key={hardModeTickPulse}
          className="boost-animation inline-flex"
          style={
            {
              "--boost-scale": hardModeClockBoostScale.toString(),
            } as NativeKeyboardClockStyle
          }
        >
          <FontAwesomeIcon
            icon={faClock}
            aria-hidden="true"
            className="text-lg"
          />
        </span>
        <span>
          {t("play.toolbar.insaneTimerValue", {
            seconds: hardModeSecondsLeft,
          })}
        </span>
      </div>
    );
  },
);

const Toolbar = (): JSX.Element => {
  const { t } = useTranslation();
  const {
    hintsEnabled,
    helpButtonEnabled,
    soundEnabled: soundFeatureEnabled,
  } = useFeatureFlags();
  const { volume, muted } = useSound();
  const [showVolumeDialog, setShowVolumeDialog] = useState(false);
  const {
    controller,
    wordListButtonEnabled,
    developerConsoleEnabled,
    dailyChallengesEnabled,
    dailyChallenges,
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
    openHelpDialog,
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
      <div className="w-full flex items-center justify-between sm:px-4">
        <FireStreak streak={currentWinStreak} />
        <div className="flex items-center justify-end gap-2 sm:gap-4 ">
          {wordListButtonEnabled && (
            <Button
              onClick={openWordsDialog}
              aria-label={t("play.toolbar.wordListAriaLabel")}
              variant="ghost"
              icon={faList}
              iconClassName="text-lg"
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
              iconClassName="text-lg"
              className="mobile-compact-button"
              hideLabelOnMobile
              disabled={hintButtonDisabled}
            >
              {t("play.toolbar.hintButton", { count: hintsRemaining })}
            </Button>
          )}
          {dailyChallengesEnabled && dailyChallenges.challenges && (
            <Button
              onClick={dailyChallenges.openDialog}
              aria-label={t("challenges.buttonAriaLabel")}
              variant="ghost"
              icon={faTrophy}
              iconClassName="text-lg"
              className="mobile-compact-button"
              hideLabelOnMobile
            >
              {t("challenges.buttonLabel")}
            </Button>
          )}
          {helpButtonEnabled && (
            <Button
              onClick={openHelpDialog}
              aria-label={t("play.toolbar.helpAriaLabel")}
              variant="ghost"
              icon={faCircleQuestion}
              iconClassName="text-lg"
              className="mobile-compact-button"
              hideLabelOnMobile
            >
              {t("play.toolbar.helpButton")}
            </Button>
          )}
          {canReopenEndOfGameDialog ? (
            <Button
              onClick={reopenEndOfGameDialog}
              aria-label={t("play.toolbar.resultsAriaLabel")}
              variant="ghost"
              icon={faSquarePollHorizontal}
              iconClassName="text-lg"
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
              iconClassName="text-lg"
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
              iconClassName="text-lg"
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
