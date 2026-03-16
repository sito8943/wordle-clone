import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useDialogCloseTransition } from "../../hooks";
import { Button } from "../Button";
import { Dialog } from "../Dialog";
import {
  DIALOG_CLOSE_DURATION_MS,
  getDialogTransitionClasses,
} from "../ConfirmationDialog";
import {
  INITIAL_PLAYER_DIALOG_DESCRIPTION,
  INITIAL_PLAYER_DIALOG_EMPTY_NAME_ERROR,
  INITIAL_PLAYER_DIALOG_INPUT_ID,
  INITIAL_PLAYER_DIALOG_PRIMARY_ACTION_LABEL,
  INITIAL_PLAYER_DIALOG_TITLE,
  INITIAL_PLAYER_DIALOG_TITLE_ID,
} from "./constants";
import type { InitialPlayerDialogProps } from "./types";

const InitialPlayerDialog = ({
  initialName,
  onConfirm,
  onValidateName,
}: InitialPlayerDialogProps) => {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const { isClosing, closeWithAction } = useDialogCloseTransition(
    DIALOG_CLOSE_DURATION_MS,
  );
  const { backdropAnimationClassName, panelAnimationClassName } =
    getDialogTransitionClasses(isClosing);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isClosing || isSubmitting) {
      return;
    }

    if (name.trim().length === 0) {
      setError(INITIAL_PLAYER_DIALOG_EMPTY_NAME_ERROR);
      return;
    }

    setIsSubmitting(true);

    if (onValidateName) {
      const validationError = await onValidateName(name);
      if (validationError) {
        setError(validationError);
        setIsSubmitting(false);
        return;
      }
    }

    setError("");
    setIsSubmitting(false);
    closeWithAction(() => onConfirm(name));
  };

  return (
    <Dialog
      titleId={INITIAL_PLAYER_DIALOG_TITLE_ID}
      title={INITIAL_PLAYER_DIALOG_TITLE}
      description={INITIAL_PLAYER_DIALOG_DESCRIPTION}
      zIndexClassName="z-30"
      backdropAnimationClassName={backdropAnimationClassName}
      panelAnimationClassName={panelAnimationClassName}
    >
      <form className="mt-4" onSubmit={handleSubmit}>
        <label
          htmlFor={INITIAL_PLAYER_DIALOG_INPUT_ID}
          className="block text-sm font-semibold text-neutral-900 dark:text-neutral-200"
        >
          Player name
        </label>
        <input
          ref={nameInputRef}
          id={INITIAL_PLAYER_DIALOG_INPUT_ID}
          type="text"
          value={name}
          disabled={isClosing || isSubmitting}
          maxLength={30}
          onChange={(
            event: ChangeEvent<HTMLInputElement, HTMLInputElement>,
          ) => {
            setName(event.target.value);
            if (error) {
              setError("");
            }
            event.stopPropagation();
          }}
          className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
        />

        {error ? <p className="mt-2 input-error-text">{error}</p> : null}

        <div className="mt-5 flex justify-end">
          <Button type="submit" disabled={isClosing || isSubmitting}>
            {INITIAL_PLAYER_DIALOG_PRIMARY_ACTION_LABEL}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default InitialPlayerDialog;
