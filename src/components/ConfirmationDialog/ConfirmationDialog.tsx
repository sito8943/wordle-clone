import Button from "../Button/Button";
import type { ConfirmationDialogProps } from "./types";

const ConfirmationDialog = ({
  title,
  description,
  confirmActionLabel,
  cancelActionLabel,
  dialogTitleId,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) => {
  return (
    <div className="dialog-backdrop z-20">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogTitleId}
        className="dialog-panel"
      >
        <h2 id={dialogTitleId} className="dialog-title">
          {title}
        </h2>
        <p className="dialog-description">{description}</p>

        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <Button onClick={onConfirm}>{confirmActionLabel}</Button>
          <Button onClick={onCancel} variant="outline">
            {cancelActionLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
