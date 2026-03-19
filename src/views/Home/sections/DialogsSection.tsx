import { lazy, Suspense, type JSX } from "react";
import { useNavigate } from "react-router";
import { ErrorBoundary, ErrorFallback } from "@components";
import { useTranslation } from "@i18n";
import { useHomeView } from "../providers/";

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

const DialogsSection = (): JSX.Element => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { controller, wordListButtonEnabled } = useHomeView();
  const {
    message,
    showResumeDialog,
    showRefreshDialog,
    showWordsDialog,
    showHelpDialog,
    showDeveloperConsoleDialog,
    showVictoryDialog,
    showDefeatDialog,
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
    closeWordsDialog,
    closeHelpDialog,
    closeDeveloperConsoleDialog,
  } = controller;
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
          <SessionResumeDialog
            visible={resumeDialogVisible}
            onClose={continuePreviousBoard}
            onStartNew={startNewBoard}
          />
          <RefreshConfirmationDialog
            visible={refreshDialogVisible}
            onClose={cancelRefreshBoard}
            onConfirm={confirmRefreshBoard}
          />
          <WordListDialog
            visible={wordListDialogVisible}
            language="en"
            words={dictionaryWords}
            onClose={closeWordsDialog}
          />
          <HelpDialog visible={helpDialogVisible} onClose={closeHelpDialog} />
          {victoryScoreSummary ? (
            <VictoryDialog
              visible={showVictoryDialog}
              answer={endOfGameAnswer}
              currentStreak={endOfGameCurrentStreak}
              scoreSummary={victoryScoreSummary}
              onClose={closeEndOfGameDialog}
              onPlayAgain={startNewBoard}
            />
          ) : null}
          <DefeatDialog
            visible={showDefeatDialog}
            answer={endOfGameAnswer}
            bestStreak={endOfGameBestStreak}
            onClose={closeEndOfGameDialog}
            onPlayAgain={startNewBoard}
            onChangeDifficulty={changeDifficulty}
          />
          <HomeDeveloperConsoleDialog
            visible={developerConsoleDialogVisible}
            onClose={closeDeveloperConsoleDialog}
          />
        </Suspense>
      </>
    </ErrorBoundary>
  );
};

export default DialogsSection;
