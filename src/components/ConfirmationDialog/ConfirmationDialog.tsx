import { useDialogCloseTransition } from "../../hooks";
import { Button } from "../Button";
import { DIALOG_CLOSE_DURATION_MS } from "./constants";
import type { ConfirmationDialogProps } from "./types";
import { getDialogTransitionClasses } from "./utils";

const ConfirmationDialog = ({
  title,
  description,
  confirmActionLabel,
  cancelActionLabel,
  dialogTitleId,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) => {
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
        aria-labelledby={dialogTitleId}
        className={`dialog-panel ${panelAnimationClassName}`}
      >
        <h2 id={dialogTitleId} className="dialog-title">
          {title}
        </h2>
        <p className="dialog-description">{description}</p>

        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <Button
            onClick={() => closeWithAction(onConfirm)}
            disabled={isClosing}
          >
            {confirmActionLabel}
          </Button>
          <Button
            onClick={() => closeWithAction(onCancel)}
            variant="outline"
            disabled={isClosing}
          >
            {cancelActionLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
