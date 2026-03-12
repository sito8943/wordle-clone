import Button from "../Button/Button";

type SessionResumeDialogProps = {
  onContinue: () => void;
  onStartNew: () => void;
  title?: string;
  description?: string;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  dialogTitleId?: string;
};

const SessionResumeDialog = (props: SessionResumeDialogProps) => {
  const {
    onContinue,
    onStartNew,
    title = "Resume previous game?",
    description = "We found an in-progress board from another browser tab session.",
    primaryActionLabel = "Start new game",
    secondaryActionLabel = "Continue previous board",
    dialogTitleId = "resume-dialog-title",
  } = props;

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
          <Button onClick={onStartNew}>{primaryActionLabel}</Button>
          <Button onClick={onContinue} variant="outline">
            {secondaryActionLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SessionResumeDialog;
