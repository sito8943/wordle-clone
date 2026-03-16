import { useDialogCloseTransition } from "../../hooks";
import {
  DIALOG_CLOSE_DURATION_MS,
  getDialogTransitionClasses,
} from "../ConfirmationDialog";
import { Button } from "../Button";
import { HELP_DIALOG_TITLE_ID } from "./constants";
import type { HelpDialogProps } from "./types";

const HelpDialog = ({ onClose }: HelpDialogProps) => {
  const { isClosing, closeWithAction } = useDialogCloseTransition(
    DIALOG_CLOSE_DURATION_MS,
  );
  const { backdropAnimationClassName, panelAnimationClassName } =
    getDialogTransitionClasses(isClosing);

  return (
    <div className={`dialog-backdrop z-20 ${backdropAnimationClassName}`}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={HELP_DIALOG_TITLE_ID}
        className={`dialog-panel max-w-2xl ${panelAnimationClassName}`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id={HELP_DIALOG_TITLE_ID} className="dialog-title">
              How to play
            </h2>
            <p className="dialog-description">
              Guess the hidden 5-letter word in up to 6 attempts.
            </p>
          </div>
          <Button
            onClick={() => closeWithAction(onClose)}
            variant="outline"
            disabled={isClosing}
          >
            Close
          </Button>
        </div>

        <div className="mt-4 space-y-4 text-sm text-neutral-800 dark:text-neutral-200">
          <section>
            <h3 className="text-base font-semibold">Rules</h3>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Each guess must be 5 letters long.</li>
              <li>Press Enter to submit your guess.</li>
              <li>Easy, Normal, and Hard accept non-dictionary words.</li>
              <li>Insane only accepts words from the dictionary.</li>
              <li>Green tile: correct letter in the correct position.</li>
              <li>Yellow tile: correct letter in the wrong position.</li>
              <li>Gray tile: letter is not in the word.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-base font-semibold">Scoring</h3>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Base points are the remaining attempts after a win.</li>
              <li>Easy: x1 points per remaining attempt.</li>
              <li>Normal: x2 points per remaining attempt.</li>
              <li>Hard: x3 points per remaining attempt.</li>
              <li>Insane: x4 points per remaining attempt.</li>
              <li>Final score = base points x difficulty multiplier.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HelpDialog;
