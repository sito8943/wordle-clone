import { lazy, memo, Suspense, type JSX } from "react";
import { ErrorBoundary, ErrorFallback } from "@components";
import { useTranslation } from "@i18n";
import { WORDLE_MODE_IDS } from "@domain/wordle";
import { DIALOG_QUEUE_PRIORITIES, useDialogQueueItem } from "@providers";
import { useFeatureFlags } from "@providers/FeatureFlags";
import { PLAY_DIALOG_IDS } from "@views/Play/constants";
import { usePlayView } from "@views/Play/providers";

const SessionResumeDialog = lazy(
  () =>
    import("../../components/Dialogs/SessionResumeDialog/SessionResumeDialog"),
);
const DictionaryChecksumDialog = lazy(
  () =>
    import("../../components/Dialogs/DictionaryChecksumDialog/DictionaryChecksumDialog"),
);
const RefreshConfirmationDialog = lazy(
  () =>
    import("../../components/Dialogs/RefreshConfirmationDialog/RefreshConfirmationDialog"),
);
const TutorialPromptDialog = lazy(
  () =>
    import("../../components/Dialogs/TutorialPromptDialog/TutorialPromptDialog"),
);
const GameplayTourDialog = lazy(
  () =>
    import("../../components/Dialogs/GameplayTourDialog/GameplayTourDialog"),
);
const WordListDialog = lazy(
  () => import("../../components/Dialogs/WordListDialog/WordListDialog"),
);
const DailyMeaningDialog = lazy(
  () =>
    import("../../components/Dialogs/DailyMeaningDialog/DailyMeaningDialog"),
);
const DailyCompletedDialog = lazy(
  () =>
    import("../../components/Dialogs/DailyCompletedDialog/DailyCompletedDialog"),
);
const PlayDeveloperConsoleDialog = lazy(
  () => import("../../components/Dialogs/DeveloperConsoleDialog"),
);
const VictoryDialog = lazy(
  () => import("../../components/Dialogs/VictoryDialog/VictoryDialog"),
);
const DefeatDialog = lazy(
  () => import("../../components/Dialogs/DefeatDialog/DefeatDialog"),
);
const ChallengesDialog = lazy(
  () =>
    import("../../components/Dialogs/DailyChallengesDialog/ChallengesDialog"),
);
const DifficultyChangeDialog = lazy(
  () =>
    import("../../components/Dialogs/DifficultyChangeDialog/DifficultyChangeDialog"),
);

const DialogsSection = (): JSX.Element => {
  const { t } = useTranslation();
  const { shareButtonEnabled, settingsDrawerEnabled } = useFeatureFlags();
  const {
    controller,
    player,
    wordListButtonEnabled,
    developerConsoleEnabled,
    challengesEnabled,
    challenges,
  } = usePlayView();
  const gameMode = t(`play.gameModes.${controller.activeModeId}`);
  const {
    message,
    showLightningModeStartCue,
    showResumeDialog,
    showDictionaryChecksumDialog,
    showRefreshDialog,
    showTutorialPromptDialog,
    showGameplayTourDialog,
    gameplayTourSteps,
    gameplayTourStepIndex,
    canGoToPreviousGameplayTourStep,
    closeGameplayTour,
    goToNextGameplayTourStep,
    goToPreviousGameplayTourStep,
    openModeHelpFromGameplayTour,
    showWordsDialog,
    showDailyMeaningDialog,
    isLoadingDailyMeaning,
    dailyMeaning,
    dailyMeaningError,
    showDeveloperConsoleDialog,
    showDeveloperChallengesSection,
    showDeveloperDailySection,
    isDifficultyChangeConfirmationOpen,
    showVictoryDialog,
    showDefeatDialog,
    showDailyCompletedDialog,
    showDefeatShieldActions,
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
    useDailyShieldForCurrentDefeat,
    skipDailyShieldForCurrentDefeat,
    goToPlayRoute,
    openSettingsPanel,
    cancelRefreshBoard,
    acceptTutorialPrompt,
    declineTutorialPrompt,
    confirmDictionaryChecksumRefresh,
    confirmRefreshBoard,
    dictionaryWords,
    currentLanguage,
    closeWordsDialog,
    closeDailyMeaningDialog,
    retryDailyMeaningFetch,
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
    resetDailyForCurrentPlayerForDeveloper,
    resetDailyForAllPlayersForDeveloper,
    dailyModeDeveloperMessage,
    dailyModeDeveloperMessageKind,
  } = controller;
  const showVictoryPlayAgainAction =
    controller.activeModeId !== WORDLE_MODE_IDS.DAILY;
  const showDefeatReplayActions =
    controller.activeModeId !== WORDLE_MODE_IDS.DAILY &&
    !showDefeatShieldActions;
  const closeEndOfGameDialogAction =
    controller.activeModeId !== WORDLE_MODE_IDS.DAILY
      ? closeEndOfGameDialog
      : goToPlayRoute;

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
  const dailyCompletedDialogVisible = useDialogQueueItem(
    PLAY_DIALOG_IDS.DAILY_COMPLETED,
    showDailyCompletedDialog,
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
  const dailyMeaningDialogVisible = useDialogQueueItem(
    PLAY_DIALOG_IDS.DAILY_MEANING,
    showDailyMeaningDialog,
    DIALOG_QUEUE_PRIORITIES.PLAY,
  );
  const challengesDialogVisible = useDialogQueueItem(
    PLAY_DIALOG_IDS.CHALLENGES,
    challengesEnabled &&
      challenges.showDialog &&
      challenges.challenges !== null,
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
  const gameplayTourDialogVisible = useDialogQueueItem(
    PLAY_DIALOG_IDS.GAMEPLAY_TOUR,
    showGameplayTourDialog,
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
        showGameplayTourDialog,
        showWordsDialog,
        showDailyMeaningDialog,
        showDeveloperConsoleDialog,
        isDifficultyChangeConfirmationOpen,
        showVictoryDialog,
        showDefeatDialog,
        showDailyCompletedDialog,
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
        {showLightningModeStartCue ? (
          <div
            role="status"
            aria-live="assertive"
            className="pointer-events-none fixed left-1/2 top-20 z-20 -translate-x-1/2 rounded-xl border border-amber-200/70 bg-amber-100/95 px-5 py-3 text-center shadow-xl dark:border-amber-500/50 dark:bg-amber-900/85"
          >
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-950 dark:text-amber-100">
              {gameMode}
            </p>
            <p className="mt-1 text-base font-extrabold uppercase tracking-[0.12em] text-amber-900 dark:text-amber-50">
              {t("play.lightningStartCue.begin")}
            </p>
          </div>
        ) : null}
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
          {dailyMeaningDialogVisible ? (
            <DailyMeaningDialog
              visible
              meaning={dailyMeaning}
              loading={isLoadingDailyMeaning}
              errorMessage={dailyMeaningError}
              onClose={closeDailyMeaningDialog}
              onRetry={retryDailyMeaningFetch}
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
              showPlayAgainAction={showVictoryPlayAgainAction}
              onClose={closeEndOfGameDialogAction}
              onPlayAgain={startNewBoard}
              onShare={shareVictoryBoard}
            />
          ) : null}
          {defeatDialogVisible ? (
            <DefeatDialog
              visible
              answer={endOfGameAnswer}
              bestStreak={endOfGameBestStreak}
              showShieldActions={showDefeatShieldActions}
              showSettingsHint={showEndOfGameSettingsHint}
              showPlayAgainAction={showDefeatReplayActions}
              showChangeDifficultyAction={
                settingsDrawerEnabled && showDefeatReplayActions
              }
              onClose={closeEndOfGameDialogAction}
              onUseShield={useDailyShieldForCurrentDefeat}
              onSkipShield={skipDailyShieldForCurrentDefeat}
              onPlayAgain={startNewBoard}
              onChangeDifficulty={changeDifficulty}
            />
          ) : null}
          {dailyCompletedDialogVisible ? (
            <DailyCompletedDialog
              visible
              answer={endOfGameAnswer}
              onClose={goToPlayRoute}
              onGoToGameModes={goToPlayRoute}
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
              showChallengesSection={showDeveloperChallengesSection}
              showDailySection={showDeveloperDailySection}
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
              resetDailyForCurrentPlayerForDeveloper={
                resetDailyForCurrentPlayerForDeveloper
              }
              resetDailyForAllPlayersForDeveloper={
                resetDailyForAllPlayersForDeveloper
              }
              dailyModeDeveloperMessage={dailyModeDeveloperMessage}
              dailyModeDeveloperMessageKind={dailyModeDeveloperMessageKind}
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
          {gameplayTourDialogVisible ? (
            <GameplayTourDialog
              visible
              steps={gameplayTourSteps}
              stepIndex={gameplayTourStepIndex}
              canGoPrevious={canGoToPreviousGameplayTourStep}
              onClose={closeGameplayTour}
              onNextStep={goToNextGameplayTourStep}
              onPreviousStep={goToPreviousGameplayTourStep}
              onOpenHelp={openModeHelpFromGameplayTour}
            />
          ) : null}
        </Suspense>
      </>
    </ErrorBoundary>
  );
};

export default memo(DialogsSection);
