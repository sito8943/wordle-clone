import { lazy, memo, Suspense, type JSX } from "react";
import { ErrorBoundary, ErrorFallback } from "@components";
import { useTranslation } from "@i18n";
import { DIALOG_QUEUE_PRIORITIES, useDialogQueueItem } from "@providers";
import { useFeatureFlags } from "@providers/FeatureFlags";
import { PLAY_DIALOG_IDS } from "@views/Play/constants";
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
  () =>
    import("../components/Dialogs/TutorialPromptDialog/TutorialPromptDialog"),
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

  const resumeDialogVisible = useDialogQueueItem(
    PLAY_DIALOG_IDS.RESUME,
    showResumeDialog,
    DIALOG_QUEUE_PRIORITIES.PLAY,
  );
  const victoryDialogVisible = useDialogQueueItem(
    PLAY_DIALOG_IDS.VICTORY,
    Boolean(victoryScoreSummary) && showVictoryDialog,
    DIALOG_QUEUE_PRIORITIES.PLAY,
  );
  const defeatDialogVisible = useDialogQueueItem(
    PLAY_DIALOG_IDS.DEFEAT,
    showDefeatDialog,
    DIALOG_QUEUE_PRIORITIES.PLAY,
  );
  const dictionaryChecksumDialogVisible = useDialogQueueItem(
    PLAY_DIALOG_IDS.DICTIONARY_CHECKSUM,
    showDictionaryChecksumDialog,
    DIALOG_QUEUE_PRIORITIES.PLAY,
  );
  const refreshDialogVisible = useDialogQueueItem(
    PLAY_DIALOG_IDS.REFRESH_CONFIRMATION,
    showRefreshDialog,
    DIALOG_QUEUE_PRIORITIES.PLAY,
  );
  const difficultyChangeDialogVisible = useDialogQueueItem(
    PLAY_DIALOG_IDS.DIFFICULTY_CHANGE,
    isDifficultyChangeConfirmationOpen,
    DIALOG_QUEUE_PRIORITIES.PLAY,
  );
  const wordListDialogVisible = useDialogQueueItem(
    PLAY_DIALOG_IDS.WORD_LIST,
    wordListButtonEnabled && showWordsDialog,
    DIALOG_QUEUE_PRIORITIES.PLAY,
  );
  const challengesDialogVisible = useDialogQueueItem(
    PLAY_DIALOG_IDS.CHALLENGES,
    challengesEnabled && challenges.showDialog && challenges.challenges !== null,
    DIALOG_QUEUE_PRIORITIES.PLAY,
  );
  const developerConsoleDialogVisible = useDialogQueueItem(
    PLAY_DIALOG_IDS.DEVELOPER_CONSOLE,
    showDeveloperConsoleDialog,
    DIALOG_QUEUE_PRIORITIES.PLAY,
  );
  const tutorialPromptDialogVisible = useDialogQueueItem(
    PLAY_DIALOG_IDS.TUTORIAL_PROMPT,
    showTutorialPromptDialog,
    DIALOG_QUEUE_PRIORITIES.PLAY,
  );

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
        isDifficultyChangeConfirmationOpen,
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
          {difficultyChangeDialogVisible ? <DifficultyChangeDialog /> : null}
          {wordListDialogVisible ? (
            <WordListDialog
              visible
              language={currentLanguage}
              words={dictionaryWords}
              onClose={closeWordsDialog}
            />
          ) : null}
          {victoryDialogVisible && victoryScoreSummary ? (
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
          ) : null}
          {defeatDialogVisible ? (
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
          {tutorialPromptDialogVisible ? (
            <TutorialPromptDialog
              visible
              gameMode={gameMode}
              onClose={declineTutorialPrompt}
              onConfirm={acceptTutorialPrompt}
            />
          ) : null}
        </Suspense>
      </>
    </ErrorBoundary>
  );
};

export default memo(DialogsSection);
