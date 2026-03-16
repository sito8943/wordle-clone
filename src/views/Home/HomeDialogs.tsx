import type { JSX } from "react";
import {
  DeveloperConsoleDialog,
  ErrorBoundary,
  ErrorFallback,
  HelpDialog,
  RefreshConfirmationDialog,
  SessionResumeDialog,
  WordListDialog,
} from "../../components";
import type { HomeDialogsProps } from "./types";

const HomeDialogs = ({
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
  wordListButtonEnabled,
  dictionaryWords,
  closeWordsDialog,
  closeHelpDialog,
  developerConsoleEnabled,
  player,
  closeDeveloperConsoleDialog,
  submitDeveloperPlayer,
}: HomeDialogsProps): JSX.Element => {
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
        {showResumeDialog && (
          <SessionResumeDialog
            onContinue={continuePreviousBoard}
            onStartNew={startNewBoard}
          />
        )}
        {!showResumeDialog && showRefreshDialog && (
          <RefreshConfirmationDialog
            onCancel={cancelRefreshBoard}
            onConfirm={confirmRefreshBoard}
          />
        )}
        {!showResumeDialog && wordListButtonEnabled && showWordsDialog && (
          <WordListDialog
            language="en"
            words={dictionaryWords}
            onClose={closeWordsDialog}
          />
        )}
        {!showResumeDialog && showHelpDialog && (
          <HelpDialog onClose={closeHelpDialog} />
        )}
        {!showResumeDialog &&
          developerConsoleEnabled &&
          showDeveloperConsoleDialog && (
            <DeveloperConsoleDialog
              player={player}
              onClose={closeDeveloperConsoleDialog}
              onSubmit={submitDeveloperPlayer}
            />
          )}
      </>
    </ErrorBoundary>
  );
};

export default HomeDialogs;
