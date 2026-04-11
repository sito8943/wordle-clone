import { lazy, memo, Suspense, type JSX } from "react";
import { useNavigate } from "react-router";
import { ErrorBoundary, ErrorFallback } from "@components";
import { useTranslation } from "@i18n";
import { useFeatureFlags } from "@providers/FeatureFlags";
import { usePlayView } from "@views/Play/providers";

const SessionResumeDialog = lazy(
  () => import("../components/Dialogs/SessionResumeDialog/SessionResumeDialog"),
);
const DictionaryChecksumDialog = lazy(
  () =>
    import("../components/Dialogs/DictionaryChecksumDialog/DictionaryChecksumDialog"),
);
const RefreshConfirmationDialog = lazy(
  () =>
    import("../components/Dialogs/RefreshConfirmationDialog/RefreshConfirmationDialog"),
);
const WordListDialog = lazy(
  () => import("../components/Dialogs/WordListDialog/WordListDialog"),
);
const HelpDialog = lazy(
  () => import("../components/Dialogs/HelpDialog/HelpDialog"),
);
const PlayDeveloperConsoleDialog = lazy(
  () => import("../components/Dialogs/DeveloperConsoleDialog"),
);
const VictoryDialog = lazy(
  () => import("../components/Dialogs/VictoryDialog/VictoryDialog"),
);
const DefeatDialog = lazy(
  () => import("../components/Dialogs/DefeatDialog/DefeatDialog"),
);
const DailyChallengesDialog = lazy(
  () =>
    import("../components/Dialogs/DailyChallengesDialog/DailyChallengesDialog"),
);

const DialogsSection = (): JSX.Element => {
  const { t } = useTranslation();
  const { shareButtonEnabled, helpButtonEnabled } = useFeatureFlags();
  const {
    controller,
    player,
    wordListButtonEnabled,
    developerConsoleEnabled,
    dailyChallengesEnabled,
    dailyChallenges,
  } = usePlayView();
  const {
    message,
    showResumeDialog,
    showDictionaryChecksumDialog,
    showRefreshDialog,
    showWordsDialog,
    showHelpDialog,
    showDeveloperConsoleDialog,
    showVictoryDialog,
    showDefeatDialog,
    answer,
    victoryBoardShareSupported,
    isSharingVictoryBoard,
    victoryBoardShareError,
    shareVictoryBoard,
    showEndOfGameSettingsHint,
    endOfGameAnswer,
    victoryScoreSummary,
    endOfGameChallengeBonusPoints,
    endOfGameCurrentStreak,
    endOfGameBestStreak,
    continuePreviousBoard,
    startNewBoard,
    closeEndOfGameDialog,
    cancelRefreshBoard,
    confirmDictionaryChecksumRefresh,
    confirmRefreshBoard,
    dictionaryWords,
    currentLanguage,
    closeWordsDialog,
    closeHelpDialog,
    closeDeveloperConsoleDialog,
    submitDeveloperPlayer,
    refreshRemoteDictionaryChecksum,
    isRefreshingDictionaryChecksum,
    dictionaryChecksumMessage,
    dictionaryChecksumMessageKind,
    refreshDailyChallengesForDeveloper,
    changeDailyChallengesForDeveloper,
    isRefreshingDailyChallengesForDeveloper,
    isChangingDailyChallengesForDeveloper,
    dailyChallengesDeveloperMessage,
    dailyChallengesDeveloperMessageKind,
  } = controller;
  const navigate = useNavigate();
  const resumeDialogVisible = showResumeDialog;
  const endOfGameDialogVisible = showVictoryDialog || showDefeatDialog;
  const dictionaryChecksumDialogVisible =
    !showResumeDialog &&
    !endOfGameDialogVisible &&
    showDictionaryChecksumDialog;
  const refreshDialogVisible =
    !showResumeDialog &&
    !endOfGameDialogVisible &&
    !dictionaryChecksumDialogVisible &&
    showRefreshDialog;
  const wordListDialogVisible =
    !showResumeDialog &&
    !endOfGameDialogVisible &&
    !dictionaryChecksumDialogVisible &&
    wordListButtonEnabled &&
    showWordsDialog;
  const helpDialogVisible =
    helpButtonEnabled &&
    !showResumeDialog &&
    !endOfGameDialogVisible &&
    !dictionaryChecksumDialogVisible &&
    showHelpDialog;
  const dailyChallengesDialogVisible =
    dailyChallengesEnabled &&
    !showResumeDialog &&
    !endOfGameDialogVisible &&
    !dictionaryChecksumDialogVisible &&
    dailyChallenges.showDialog &&
    dailyChallenges.challenges !== null;
  const developerConsoleDialogVisible =
    !showResumeDialog &&
    !endOfGameDialogVisible &&
    !dictionaryChecksumDialogVisible &&
    showDeveloperConsoleDialog;

  const changeDifficulty = () => {
    closeEndOfGameDialog();
    navigate("/settings#difficulty");
  };

  return (
    <ErrorBoundary
      name="play-overlays"
      resetKeys={[
        showResumeDialog,
        showDictionaryChecksumDialog,
        showRefreshDialog,
        showWordsDialog,
        showHelpDialog,
        showDeveloperConsoleDialog,
        showVictoryDialog,
        showDefeatDialog,
        dailyChallenges.showDialog,
      ]}
      fallback={() => (
        <div className="px-3 pb-2">
          <ErrorFallback
            title={t("play.sections.dialogsError.title")}
            description={t("play.sections.dialogsError.description")}
            actionLabel={t("play.sections.dialogsError.action")}
          />
        </div>
      )}
    >
      <>
        {message && (
          <div
            role="status"
            aria-live="polite"
            className="pointer-events-none fixed left-1/2 top-5 z-10 -translate-x-1/2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white shadow-lg"
          >
            {message}
          </div>
        )}
        <Suspense fallback={null}>
          {resumeDialogVisible ? (
            <SessionResumeDialog
              visible
              onClose={continuePreviousBoard}
              onStartNew={startNewBoard}
            />
          ) : null}
          {dictionaryChecksumDialogVisible ? (
            <DictionaryChecksumDialog
              visible
              onAccept={confirmDictionaryChecksumRefresh}
            />
          ) : null}
          {refreshDialogVisible ? (
            <RefreshConfirmationDialog
              visible
              onClose={cancelRefreshBoard}
              onConfirm={confirmRefreshBoard}
            />
          ) : null}
          {wordListDialogVisible ? (
            <WordListDialog
              visible
              language={currentLanguage}
              words={dictionaryWords}
              onClose={closeWordsDialog}
            />
          ) : null}
          {helpDialogVisible ? (
            <HelpDialog visible onClose={closeHelpDialog} />
          ) : null}
          {victoryScoreSummary ? (
            showVictoryDialog ? (
              <VictoryDialog
                visible
                answer={endOfGameAnswer}
                currentStreak={endOfGameCurrentStreak}
                scoreSummary={victoryScoreSummary}
                challengeBonusPoints={endOfGameChallengeBonusPoints}
                showSettingsHint={showEndOfGameSettingsHint}
                shareEnabled={shareButtonEnabled && victoryBoardShareSupported}
                isSharing={isSharingVictoryBoard}
                shareErrorMessage={victoryBoardShareError}
                onClose={closeEndOfGameDialog}
                onPlayAgain={startNewBoard}
                onShare={shareVictoryBoard}
              />
            ) : null
          ) : null}
          {showDefeatDialog ? (
            <DefeatDialog
              visible
              answer={endOfGameAnswer}
              bestStreak={endOfGameBestStreak}
              showSettingsHint={showEndOfGameSettingsHint}
              onClose={closeEndOfGameDialog}
              onPlayAgain={startNewBoard}
              onChangeDifficulty={changeDifficulty}
            />
          ) : null}
          {dailyChallengesDialogVisible && dailyChallenges.challenges ? (
            <DailyChallengesDialog
              visible
              challenges={dailyChallenges.challenges}
              progress={dailyChallenges.progress}
              millisUntilEndOfDay={dailyChallenges.millisUntilEndOfDay}
              onClose={dailyChallenges.closeDialog}
            />
          ) : null}
          {developerConsoleDialogVisible ? (
            <PlayDeveloperConsoleDialog
              visible
              onClose={closeDeveloperConsoleDialog}
              developerConsoleEnabled={developerConsoleEnabled}
              answer={answer}
              player={player}
              showResumeDialog={showResumeDialog}
              submitDeveloperPlayer={submitDeveloperPlayer}
              refreshRemoteDictionaryChecksum={refreshRemoteDictionaryChecksum}
              isRefreshingDictionaryChecksum={isRefreshingDictionaryChecksum}
              dictionaryChecksumMessage={dictionaryChecksumMessage}
              dictionaryChecksumMessageKind={dictionaryChecksumMessageKind}
              refreshDailyChallengesForDeveloper={
                refreshDailyChallengesForDeveloper
              }
              changeDailyChallengesForDeveloper={
                changeDailyChallengesForDeveloper
              }
              isRefreshingDailyChallengesForDeveloper={
                isRefreshingDailyChallengesForDeveloper
              }
              isChangingDailyChallengesForDeveloper={
                isChangingDailyChallengesForDeveloper
              }
              dailyChallengesDeveloperMessage={dailyChallengesDeveloperMessage}
              dailyChallengesDeveloperMessageKind={
                dailyChallengesDeveloperMessageKind
              }
            />
          ) : null}
        </Suspense>
      </>
    </ErrorBoundary>
  );
};

export default memo(DialogsSection);
