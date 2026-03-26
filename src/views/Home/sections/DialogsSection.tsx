import { lazy, memo, Suspense, type JSX } from "react";
import { useNavigate } from "react-router";
import { ErrorBoundary, ErrorFallback } from "@components";
import { useTranslation } from "@i18n";
import type { DialogsSectionProps } from "./types";

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
const HomeDeveloperConsoleDialog = lazy(
  () => import("../components/Dialogs/DeveloperConsoleDialog"),
);
const VictoryDialog = lazy(
  () => import("../components/Dialogs/VictoryDialog/VictoryDialog"),
);
const DefeatDialog = lazy(
  () => import("../components/Dialogs/DefeatDialog/DefeatDialog"),
);

const DialogsSection = ({
  message,
  showResumeDialog,
  showRefreshDialog,
  showWordsDialog,
  showHelpDialog,
  showDeveloperConsoleDialog,
  showVictoryDialog,
  showDefeatDialog,
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
  wordListButtonEnabled,
  developerConsoleEnabled,
  player,
  submitDeveloperPlayer,
  refreshRemoteDictionaryChecksum,
  isRefreshingDictionaryChecksum,
  dictionaryChecksumMessage,
  dictionaryChecksumMessageKind,
}: DialogsSectionProps): JSX.Element => {
  const { t } = useTranslation();
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
    navigate("/profile#difficulty");
  };

  return (
    <ErrorBoundary
      name="home-overlays"
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
            title={t("home.sections.dialogsError.title")}
            description={t("home.sections.dialogsError.description")}
            actionLabel={t("home.sections.dialogsError.action")}
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
                onClose={closeEndOfGameDialog}
                onPlayAgain={startNewBoard}
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
            <HomeDeveloperConsoleDialog
              visible
              onClose={closeDeveloperConsoleDialog}
              developerConsoleEnabled={developerConsoleEnabled}
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
