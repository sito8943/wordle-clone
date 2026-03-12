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
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/45 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogTitleId}
        className="w-full max-w-md rounded-2xl border border-neutral-300 bg-white p-6 shadow-2xl"
      >
        <h2 id={dialogTitleId} className="text-xl font-bold text-neutral-900">
          {title}
        </h2>
        <p className="mt-2 text-sm text-neutral-700">{description}</p>

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
