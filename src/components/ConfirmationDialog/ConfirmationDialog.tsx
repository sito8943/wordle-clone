import { useDialogCloseTransition } from "../../hooks";
import { Button } from "../Button";
import { Dialog } from "../Dialog";
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
    <Dialog
      titleId={dialogTitleId}
      title={title}
      description={description}
      backdropAnimationClassName={backdropAnimationClassName}
      panelAnimationClassName={panelAnimationClassName}
    >
      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <Button onClick={() => closeWithAction(onConfirm)} disabled={isClosing}>
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
    </Dialog>
  );
};

export default ConfirmationDialog;
