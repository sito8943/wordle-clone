import type { JSX } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleQuestion,
  faClock,
  faLightbulb,
  faList,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import { Button, FireStreak } from "../../components";
import type { HomeToolbarProps, NativeKeyboardClockStyle } from "./types";

const HomeToolbar = ({
  currentWinStreak,
  wordListButtonEnabled,
  dictionaryLoading,
  dictionaryWordsCount,
  openWordsDialog,
  hintsEnabledForDifficulty,
  useHint,
  hintButtonDisabled,
  hintsRemaining,
  openHelpDialog,
  developerConsoleEnabled,
  openDeveloperConsoleDialog,
  showHardModeTimer,
  hardModeSecondsLeft,
  hardModeTickPulse,
  hardModeClockBoostScale,
  refreshBoard,
  dictionaryError,
}: HomeToolbarProps): JSX.Element => {
  return (
    <>
      <div className="w-full flex items-center justify-end gap-2">
        <FireStreak streak={currentWinStreak} />
        {wordListButtonEnabled && (
          <Button
            onClick={openWordsDialog}
            aria-label="Word list"
            variant="ghost"
            icon={faList}
            iconClassName="text-xl"
            className="mobile-compact-button"
            hideLabelOnMobile
            disabled={dictionaryLoading || dictionaryWordsCount === 0}
          >
            Words
          </Button>
        )}
        {hintsEnabledForDifficulty && (
          <Button
            onClick={useHint}
            aria-label="Hint"
            variant="ghost"
            color={!hintButtonDisabled ? "primary" : "secondary"}
            icon={faLightbulb}
            className="mobile-compact-button"
            hideLabelOnMobile
            disabled={hintButtonDisabled}
          >
            Hint ({hintsRemaining})
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
        {developerConsoleEnabled && (
          <Button
            onClick={openDeveloperConsoleDialog}
            aria-label="Developer console"
            variant="outline"
            color="secondary"
            className="mobile-compact-button"
          >
            Dev
          </Button>
        )}
        {showHardModeTimer && (
          <div
            role="status"
            aria-live="polite"
            aria-label={`Insane timer: ${hardModeSecondsLeft} seconds`}
            className="mobile-compact-button inline-flex items-center gap-2 rounded border border-blue-300 bg-blue-100/90 px-3 py-2 text-sm font-bold text-blue-900 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-200"
          >
            <span
              key={hardModeTickPulse}
              className="hard-mode-clock-boost-animation inline-flex"
              style={
                {
                  "--hard-mode-clock-boost-scale":
                    hardModeClockBoostScale.toString(),
                } as NativeKeyboardClockStyle
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
    </>
  );
};

export default HomeToolbar;
