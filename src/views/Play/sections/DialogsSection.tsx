import { lazy, memo, Suspense, type JSX } from "react";
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
const TutorialPromptDialog = lazy(
  () => import("../components/Dialogs/TutorialPromptDialog/TutorialPromptDialog"),
);
const WordListDialog = lazy(
  () => import("../components/Dialogs/WordListDialog/WordListDialog"),
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
const ChallengesDialog = lazy(
  () => import("../components/Dialogs/DailyChallengesDialog/ChallengesDialog"),
);
const DifficultyChangeDialog = lazy(
  () =>
    import("../components/Dialogs/DifficultyChangeDialog/DifficultyChangeDialog"),
);

const DialogsSection = (): JSX.Element => {
  const { t } = useTranslation();
  const gameMode = t("play.gameModes.classic");
  const { shareButtonEnabled, settingsDrawerEnabled } = useFeatureFlags();
  const {
    controller,
    player,
    wordListButtonEnabled,
    developerConsoleEnabled,
    challengesEnabled,
    challenges,
  } = usePlayView();
  const {
    message,
    showResumeDialog,
    showDictionaryChecksumDialog,
    showRefreshDialog,
    showTutorialPromptDialog,
    showWordsDialog,
    showDeveloperConsoleDialog,
    isDifficultyChangeConfirmationOpen,
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
    openSettingsPanel,
    cancelRefreshBoard,
    acceptTutorialPrompt,
    declineTutorialPrompt,
    confirmDictionaryChecksumRefresh,
    confirmRefreshBoard,
    dictionaryWords,
    currentLanguage,
    closeWordsDialog,
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
  const challengesDialogVisible =
    challengesEnabled &&
    !showResumeDialog &&
    !endOfGameDialogVisible &&
    !dictionaryChecksumDialogVisible &&
    challenges.showDialog &&
    challenges.challenges !== null;
  const developerConsoleDialogVisible =
    !showResumeDialog &&
    !endOfGameDialogVisible &&
    !dictionaryChecksumDialogVisible &&
    showDeveloperConsoleDialog;
  const tutorialPromptDialogVisible =
    !showResumeDialog &&
    !endOfGameDialogVisible &&
    !dictionaryChecksumDialogVisible &&
    !refreshDialogVisible &&
    !wordListDialogVisible &&
    !challengesDialogVisible &&
    !developerConsoleDialogVisible &&
    !isDifficultyChangeConfirmationOpen &&
    showTutorialPromptDialog;

  const changeDifficulty = () => {
    if (!settingsDrawerEnabled) {
      return;
    }

    closeEndOfGameDialog();
    openSettingsPanel();
  };

  return (
    <ErrorBoundary
      name="play-overlays"
      resetKeys={[
        showResumeDialog,
        showDictionaryChecksumDialog,
        showRefreshDialog,
        showTutorialPromptDialog,
        showWordsDialog,
        showDeveloperConsoleDialog,
        showVictoryDialog,
        showDefeatDialog,
        challenges.showDialog,
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
          {tutorialPromptDialogVisible ? (
            <TutorialPromptDialog
              visible
              gameMode={gameMode}
              onClose={declineTutorialPrompt}
              onConfirm={acceptTutorialPrompt}
            />
          ) : null}
          <DifficultyChangeDialog />
          {wordListDialogVisible ? (
            <WordListDialog
              visible
              language={currentLanguage}
              words={dictionaryWords}
              onClose={closeWordsDialog}
            />
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
              showChangeDifficultyAction={settingsDrawerEnabled}
              onClose={closeEndOfGameDialog}
              onPlayAgain={startNewBoard}
              onChangeDifficulty={changeDifficulty}
            />
          ) : null}
          {challengesDialogVisible && challenges.challenges ? (
            <ChallengesDialog
              visible
              challenges={challenges.challenges}
              progress={challenges.progress}
              millisUntilEndOfDay={challenges.millisUntilEndOfDay}
              onClose={challenges.closeDialog}
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
