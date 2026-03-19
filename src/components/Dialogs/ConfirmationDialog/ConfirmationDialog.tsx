import { Button } from "@components/Button";
import { Dialog, useDialogCloseTransition } from "@components/Dialogs";
import { DIALOG_CLOSE_DURATION_MS } from "./constants";
import { getDialogTransitionClasses } from "./utils";
import type { ConfirmationDialogProps } from "./types";

const ConfirmationDialog = ({
  visible,
  onClose,
  title,
  description,
  confirmActionLabel,
  cancelActionLabel,
  dialogTitleId,
  onConfirm,
}: ConfirmationDialogProps) => {
  const { isClosing, closeWithAction } = useDialogCloseTransition(
    DIALOG_CLOSE_DURATION_MS,
  );
  const { backdropAnimationClassName, panelAnimationClassName } =
    getDialogTransitionClasses(isClosing);

  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      isClosing={isClosing}
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
          onClick={() => closeWithAction(onClose)}
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
