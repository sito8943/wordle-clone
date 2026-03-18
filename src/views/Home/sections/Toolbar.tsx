import type { JSX } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleQuestion,
  faClock,
  faLightbulb,
  faList,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import { Button, FireStreak, Alert } from "@components";
import { useHomeView } from "../providers/";
import type { NativeKeyboardClockStyle } from "./types";

const Toolbar = (): JSX.Element => {
  const { controller, wordListButtonEnabled, developerConsoleEnabled } =
    useHomeView();
  const {
    currentWinStreak,
    dictionaryLoading,
    dictionaryWords,
    openWordsDialog,
    hintsEnabledForDifficulty,
    useHint,
    hintButtonDisabled,
    hintsRemaining,
    openHelpDialog,
    openDeveloperConsoleDialog,
    showHardModeTimer,
    hardModeSecondsLeft,
    hardModeTickPulse,
    hardModeClockBoostScale,
    refreshBoard,
    dictionaryError,
  } = controller;

  return (
    <>
      <div className="w-full flex items-center justify-between sm:px-4">
        <FireStreak streak={currentWinStreak} />
        <div className="flex items-center justify-end gap-2 sm:gap-4 ">
          {wordListButtonEnabled && (
            <Button
              onClick={openWordsDialog}
              aria-label="Word list"
              variant="ghost"
              icon={faList}
              iconClassName="text-lg"
              className="mobile-compact-button"
              hideLabelOnMobile
              disabled={dictionaryLoading || dictionaryWords.length === 0}
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
              iconClassName="text-lg"
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
            iconClassName="text-lg"
            className="mobile-compact-button"
            hideLabelOnMobile
          >
            Help
          </Button>
          {developerConsoleEnabled && (
            <Button
              onClick={openDeveloperConsoleDialog}
              aria-label="Developer console"
              variant="solid"
              color="danger"
              iconClassName="text-lg"
              className="mobile-compact-button fixed bottom-40 right-2"
            >
              Dev console
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
                <FontAwesomeIcon
                  icon={faClock}
                  aria-hidden="true"
                  className="text-lg"
                />
              </span>
              <span>{hardModeSecondsLeft}s</span>
            </div>
          )}
          <Button
            onClick={refreshBoard}
            aria-label="Refresh"
            icon={faRotateRight}
            variant="ghost"
            iconClassName="text-lg"
            className="mobile-compact-button"
            hideLabelOnMobile
          >
            Refresh
          </Button>
        </div>
      </div>

      {dictionaryLoading && (
        <Alert message={"Loading word list..."} color="info" />
      )}

      {!dictionaryLoading && dictionaryError && (
        <Alert message={dictionaryError} color="danger" />
      )}
    </>
  );
};

export default Toolbar;
