import type { CSSProperties, JSX } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleQuestion,
  faClock,
  faList,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import {
  Board,
  Button,
  FireStreak,
  HelpDialog,
  Keyboard,
  RefreshConfirmationDialog,
  SessionResumeDialog,
  WordListDialog,
} from "../components";
import { env } from "../config";
import { useHomeController } from "../hooks";

const Home = (): JSX.Element => {
  const {
    answer,
    guesses,
    current,
    gameOver,
    won,
    message,
    handleKey,
    startAnimationSeed,
    startAnimationsEnabled,
    keyboardEntryAnimationEnabled,
    showResumeDialog,
    showRefreshDialog,
    showWordsDialog,
    showHelpDialog,
    continuePreviousBoard,
    startNewBoard,
    currentWinStreak,
    refreshBoard,
    openWordsDialog,
    closeWordsDialog,
    openHelpDialog,
    closeHelpDialog,
    confirmRefreshBoard,
    cancelRefreshBoard,
    dictionaryWords,
    dictionaryLoading,
    dictionaryError,
    wordListEnabledForDifficulty,
    showHardModeTimer,
    showHardModeFinalStretchBar,
    hardModeSecondsLeft,
    hardModeTickPulse,
    hardModeClockBoostScale,
    hardModeFinalStretchProgressPercent,
    boardShakePulse,
  } = useHomeController();
  const animateTileEntry = startAnimationsEnabled && startAnimationSeed > 0;
  const wordListButtonEnabled =
    env.wordListButtonEnabled && wordListEnabledForDifficulty;

  return (
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
      <main className="flex flex-1 flex-col">
        <section className="flex flex-1 flex-col items-center justify-start gap-6 max-sm:gap-2 py-6 max-sm:py-2">
          <div className="w-full max-w-md flex items-center justify-end gap-2">
            <FireStreak streak={currentWinStreak} />
            {wordListButtonEnabled && (
              <Button
                onClick={openWordsDialog}
                aria-label="Word list"
                icon={faList}
                className="mobile-compact-button"
                hideLabelOnMobile
                disabled={dictionaryLoading || dictionaryWords.length === 0}
              >
                Words
              </Button>
            )}
            <Button
              onClick={openHelpDialog}
              aria-label="Help"
              variant="ghost"
              icon={faCircleQuestion}
              iconClassName="text-xl"
              className="mobile-compact-button"
              hideLabelOnMobile
            >
              Help
            </Button>
            {showHardModeTimer && (
              <div
                role="status"
                aria-live="polite"
                aria-label={`Hard timer: ${hardModeSecondsLeft} seconds`}
                className="mobile-compact-button inline-flex items-center gap-2 rounded border border-blue-300 bg-blue-100/90 px-3 py-2 text-sm font-bold text-blue-900 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-200"
              >
                <span
                  key={hardModeTickPulse}
                  className="hard-mode-clock-boost-animation inline-flex"
                  style={
                    {
                      "--hard-mode-clock-boost-scale":
                        hardModeClockBoostScale.toString(),
                    } as CSSProperties
                  }
                >
                  <FontAwesomeIcon icon={faClock} aria-hidden="true" />
                </span>
                <span>{hardModeSecondsLeft}s</span>
              </div>
            )}
            <Button
              onClick={refreshBoard}
              aria-label="Refresh"
              icon={faRotateRight}
              className="mobile-compact-button"
              hideLabelOnMobile
            >
              Refresh
            </Button>
          </div>

          {dictionaryLoading && (
            <p className="rounded border border-sky-300 bg-sky-100 px-3 py-2 text-sm text-sky-900 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-200">
              Loading word list...
            </p>
          )}

          {!dictionaryLoading && dictionaryError && (
            <p className="rounded border border-red-300 bg-red-100 px-3 py-2 text-sm text-red-900 dark:border-red-700 dark:bg-red-950/40 dark:text-red-200">
              {dictionaryError}
            </p>
          )}

          {showHardModeFinalStretchBar && (
            <div
              role="progressbar"
              aria-label="Hard mode countdown"
              aria-valuemin={0}
              aria-valuemax={15}
              aria-valuenow={hardModeSecondsLeft}
              className="w-full max-w-md"
            >
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-blue-200/80 dark:bg-blue-950/50">
                <div
                  className="h-full rounded-full bg-blue-500 transition-[width] duration-1000 ease-linear dark:bg-blue-400"
                  style={{ width: `${hardModeFinalStretchProgressPercent}%` }}
                />
              </div>
            </div>
          )}

          <Board
            key={`board-${startAnimationSeed}`}
            guesses={guesses}
            current={current}
            gameOver={gameOver}
            animateTileEntry={animateTileEntry}
            isLoss={gameOver && !won}
            animateEntry={startAnimationsEnabled && startAnimationSeed > 0}
            shakePulse={boardShakePulse}
          />

          {gameOver && (
            <>
              <p className="text-center text-base font-semibold text-neutral-800 dark:text-neutral-200 sm:text-lg">
                {won
                  ? `You got it in ${guesses.length}!`
                  : `The word was: ${answer}`}
              </p>
            </>
          )}
        </section>

        <Keyboard
          guesses={guesses}
          onKey={handleKey}
          isLoss={gameOver && !won}
          animateEntry={keyboardEntryAnimationEnabled}
        />
      </main>
    </>
  );
};

export default Home;
