import { lazy, memo, Suspense, type JSX } from "react";
import { useNavigate } from "react-router";
import { ErrorBoundary, ErrorFallback } from "@components";
import { useTranslation } from "@i18n";
import { usePlayView } from "@views/Play/providers";

const SessionResumeDialog = lazy(
  () => import("../components/Dialogs/SessionResumeDialog/SessionResumeDialog"),
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

const DialogsSection = (): JSX.Element => {
  const { t } = useTranslation();
  const { controller, player, wordListButtonEnabled, developerConsoleEnabled } =
    usePlayView();
  const {
    message,
    showResumeDialog,
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
    endOfGameCurrentStreak,
    endOfGameBestStreak,
    continuePreviousBoard,
    startNewBoard,
    closeEndOfGameDialog,
    cancelRefreshBoard,
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
  } = controller;
  const navigate = useNavigate();
  const resumeDialogVisible = showResumeDialog;
  const endOfGameDialogVisible = showVictoryDialog || showDefeatDialog;
  const refreshDialogVisible =
    !showResumeDialog && !endOfGameDialogVisible && showRefreshDialog;
  const wordListDialogVisible =
    !showResumeDialog &&
    !endOfGameDialogVisible &&
    wordListButtonEnabled &&
    showWordsDialog;
  const helpDialogVisible =
    !showResumeDialog && !endOfGameDialogVisible && showHelpDialog;
  const developerConsoleDialogVisible =
    !showResumeDialog && !endOfGameDialogVisible && showDeveloperConsoleDialog;

  const changeDifficulty = () => {
    closeEndOfGameDialog();
    navigate("/settings#difficulty");
  };

  return (
    <ErrorBoundary
      name="play-overlays"
      resetKeys={[
        showResumeDialog,
        showRefreshDialog,
        showWordsDialog,
        showHelpDialog,
        showDeveloperConsoleDialog,
        showVictoryDialog,
        showDefeatDialog,
      ]}
      fallback={({ reset }) => (
        <div className="px-3 pb-2">
          <ErrorFallback
            title={t("play.sections.dialogsError.title")}
            description={t("play.sections.dialogsError.description")}
            actionLabel={t("play.sections.dialogsError.action")}
            onAction={reset}
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
                showSettingsHint={showEndOfGameSettingsHint}
                shareEnabled={victoryBoardShareSupported}
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
            />
          ) : null}
        </Suspense>
      </>
    </ErrorBoundary>
  );
};

export default memo(DialogsSection);
