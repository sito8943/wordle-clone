type SessionResumeDialogProps = {
  onContinue: () => void;
  onStartNew: () => void;
};

const SessionResumeDialog = (props: SessionResumeDialogProps) => {
  const { onContinue, onStartNew } = props;

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/45 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="resume-dialog-title"
        className="w-full max-w-md rounded-2xl border border-neutral-300 bg-white p-6 shadow-2xl"
      >
        <h2
          id="resume-dialog-title"
          className="text-xl font-bold text-neutral-900"
        >
          Resume previous game?
        </h2>
        <p className="mt-2 text-sm text-neutral-700">
          We found an in-progress board from another browser tab session.
        </p>

        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onStartNew}
            className="rounded border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-100"
          >
            Start new game
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="rounded bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700"
          >
            Continue previous board
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionResumeDialog;
