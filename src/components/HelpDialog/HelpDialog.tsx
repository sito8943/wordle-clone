import { useDialogCloseTransition } from "../../hooks";
import {
  DIALOG_CLOSE_DURATION_MS,
  getDialogTransitionClasses,
} from "../ConfirmationDialog";
import { Button } from "../Button";
import { Dialog } from "../Dialog";
import { HELP_DIALOG_TITLE_ID } from "./constants";
import type { HelpDialogProps } from "./types";

const HelpDialog = ({ visible, onClose }: HelpDialogProps) => {
  const { isClosing, closeWithAction } = useDialogCloseTransition(
    DIALOG_CLOSE_DURATION_MS,
  );
  const { backdropAnimationClassName, panelAnimationClassName } =
    getDialogTransitionClasses(isClosing);

  return (
    <Dialog
      visible={visible}
      onClose={() => closeWithAction(onClose)}
      titleId={HELP_DIALOG_TITLE_ID}
      title="How to play"
      description="Guess the hidden 5-letter word in up to 6 attempts."
      panelClassName="max-w-2xl"
      backdropAnimationClassName={backdropAnimationClassName}
      panelAnimationClassName={panelAnimationClassName}
      headerAction={
        <Button
          onClick={() => closeWithAction(onClose)}
          variant="outline"
          disabled={isClosing}
        >
          Close
        </Button>
      }
    >
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
            <li>Streak bonus adds your current streak value to each win.</li>
            <li>Easy: +1 difficulty bonus.</li>
            <li>Normal: +2 difficulty bonus.</li>
            <li>Hard: +3 difficulty bonus.</li>
            <li>Insane: +4 difficulty bonus.</li>
            <li>
              Final score = base points + difficulty bonus + streak bonus.
            </li>
          </ul>
        </section>
      </div>
    </Dialog>
  );
};

export default HelpDialog;
