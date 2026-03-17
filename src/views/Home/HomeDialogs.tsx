import { lazy, Suspense, type JSX } from "react";
import { ErrorBoundary, ErrorFallback } from "@components";
import { useHomeView } from "./useHomeView";

const SessionResumeDialog = lazy(
  () => import("./SessionResumeDialog/SessionResumeDialog"),
);
const RefreshConfirmationDialog = lazy(
  () => import("./RefreshConfirmationDialog/RefreshConfirmationDialog"),
);
const WordListDialog = lazy(() => import("./WordListDialog/WordListDialog"));
const HelpDialog = lazy(() => import("./HelpDialog/HelpDialog"));
const HomeDeveloperConsoleDialog = lazy(
  () => import("./HomeDeveloperConsoleDialog"),
);

const HomeDialogs = (): JSX.Element => {
  const { controller, wordListButtonEnabled } = useHomeView();
  const {
    message,
    showResumeDialog,
    showRefreshDialog,
    showWordsDialog,
    showHelpDialog,
    showDeveloperConsoleDialog,
    continuePreviousBoard,
    startNewBoard,
    cancelRefreshBoard,
    confirmRefreshBoard,
    dictionaryWords,
    closeWordsDialog,
    closeHelpDialog,
    closeDeveloperConsoleDialog,
  } = controller;
  const resumeDialogVisible = showResumeDialog;
  const refreshDialogVisible = !showResumeDialog && showRefreshDialog;
  const wordListDialogVisible =
    !showResumeDialog && wordListButtonEnabled && showWordsDialog;
  const helpDialogVisible = !showResumeDialog && showHelpDialog;
  const developerConsoleDialogVisible =
    !showResumeDialog && showDeveloperConsoleDialog;

  return (
    <ErrorBoundary
      name="home-overlays"
      resetKeys={[
        showResumeDialog,
        showRefreshDialog,
        showWordsDialog,
        showHelpDialog,
        showDeveloperConsoleDialog,
      ]}
      fallback={({ reset }) => (
        <div className="px-3 pb-2">
          <ErrorFallback
            title="A dialog failed to render."
            description="Retry to open this panel again."
            actionLabel="Retry panel"
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
              visible={resumeDialogVisible}
              onClose={continuePreviousBoard}
              onStartNew={startNewBoard}
            />
          ) : null}
          {refreshDialogVisible ? (
            <RefreshConfirmationDialog
              visible={refreshDialogVisible}
              onClose={cancelRefreshBoard}
              onConfirm={confirmRefreshBoard}
            />
          ) : null}
          {wordListDialogVisible ? (
            <WordListDialog
              visible={wordListDialogVisible}
              language="en"
              words={dictionaryWords}
              onClose={closeWordsDialog}
            />
          ) : null}
          {helpDialogVisible ? (
            <HelpDialog visible={helpDialogVisible} onClose={closeHelpDialog} />
          ) : null}
          {developerConsoleDialogVisible ? (
            <HomeDeveloperConsoleDialog
              visible={developerConsoleDialogVisible}
              onClose={closeDeveloperConsoleDialog}
            />
          ) : null}
        </Suspense>
      </>
    </ErrorBoundary>
  );
};

export default HomeDialogs;
