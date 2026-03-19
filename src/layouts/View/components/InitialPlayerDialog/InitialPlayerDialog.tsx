import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useTranslation } from "@i18n";
import {
  DIALOG_CLOSE_DURATION_MS,
  getDialogTransitionClasses,
} from "@components/Dialogs/ConfirmationDialog";
import {
  INITIAL_PLAYER_DIALOG_INPUT_ID,
  INITIAL_PLAYER_DIALOG_RECOVERY_INPUT_ID,
  INITIAL_PLAYER_DIALOG_TITLE_ID,
} from "./constants";
import type { InitialPlayerDialogProps } from "./types";
import { Button, Dialog, useDialogCloseTransition } from "@components";

const InitialPlayerDialog = ({
  visible,
  onClose,
  initialName,
  onConfirm,
  onRecover,
  onValidateName,
}: InitialPlayerDialogProps) => {
  const { t } = useTranslation();
  const [name, setName] = useState(initialName);
  const [recoveryCode, setRecoveryCode] = useState("");
  const [mode, setMode] = useState<"create" | "recover">("create");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const recoveryInputRef = useRef<HTMLInputElement>(null);
  const { isClosing, closeWithAction } = useDialogCloseTransition(
    DIALOG_CLOSE_DURATION_MS,
  );
  const { backdropAnimationClassName, panelAnimationClassName } =
    getDialogTransitionClasses(isClosing);

  useEffect(() => {
    if (mode === "create") {
      nameInputRef.current?.focus();
      return;
    }

    recoveryInputRef.current?.focus();
  }, [mode]);

  const handleCreateSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (isClosing || isSubmitting) {
      return;
    }

    if (name.trim().length === 0) {
      setError(t("layout.initialPlayer.emptyNameError"));
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
    const submitError = await onConfirm(name);
    setIsSubmitting(false);
    if (submitError) {
      setError(submitError);
      return;
    }

    closeWithAction(() => undefined);
  };

  const handleRecoverSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (isClosing || isSubmitting) {
      return;
    }

    if (recoveryCode.trim().length === 0) {
      setError(t("layout.initialPlayer.emptyCodeError"));
      return;
    }

    setIsSubmitting(true);
    setError("");

    const submitError = await onRecover(recoveryCode);
    setIsSubmitting(false);
    if (submitError) {
      setError(submitError);
      return;
    }

    closeWithAction(() => undefined);
  };

  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      isClosing={isClosing}
      titleId={INITIAL_PLAYER_DIALOG_TITLE_ID}
      title={t("layout.initialPlayer.title")}
      description={t("layout.initialPlayer.description")}
      zIndexClassName="z-30"
      backdropAnimationClassName={backdropAnimationClassName}
      panelAnimationClassName={panelAnimationClassName}
    >
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant={mode !== "create" ? "solid" : "outline"}
          color="secondary"
          disabled={isClosing || isSubmitting}
          onClick={() => {
            setMode("create");
            setError("");
          }}
        >
          {t("layout.initialPlayer.createMode")}
        </Button>
        <Button
          type="button"
          variant={mode !== "recover" ? "solid" : "outline"}
          color="secondary"
          disabled={isClosing || isSubmitting}
          onClick={() => {
            setMode("recover");
            setError("");
          }}
        >
          {t("layout.initialPlayer.recoverMode")}
        </Button>
      </div>

      {mode === "create" ? (
        <form className="mt-4" onSubmit={handleCreateSubmit}>
          <label
            htmlFor={INITIAL_PLAYER_DIALOG_INPUT_ID}
            className="block text-sm font-semibold text-neutral-900 dark:text-neutral-200"
          >
            {t("layout.initialPlayer.nameLabel")}
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
              {t("layout.initialPlayer.createAction")}
            </Button>
          </div>
        </form>
      ) : (
        <form className="mt-4" onSubmit={handleRecoverSubmit}>
          <label
            htmlFor={INITIAL_PLAYER_DIALOG_RECOVERY_INPUT_ID}
            className="block text-sm font-semibold text-neutral-900 dark:text-neutral-200"
          >
            {t("layout.initialPlayer.recoveryCodeLabel")}
          </label>
          <input
            ref={recoveryInputRef}
            id={INITIAL_PLAYER_DIALOG_RECOVERY_INPUT_ID}
            type="text"
            value={recoveryCode}
            disabled={isClosing || isSubmitting}
            maxLength={4}
            autoCapitalize="characters"
            onChange={(
              event: ChangeEvent<HTMLInputElement, HTMLInputElement>,
            ) => {
              setRecoveryCode(event.target.value.toUpperCase());
              if (error) {
                setError("");
              }
              event.stopPropagation();
            }}
            className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm uppercase tracking-[0.3em] text-neutral-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
          />
          <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-300">
            {t("layout.initialPlayer.recoveryHelp")}
          </p>

          {error ? <p className="mt-2 input-error-text">{error}</p> : null}

          <div className="mt-5 flex justify-end">
            <Button type="submit" disabled={isClosing || isSubmitting}>
              {t("layout.initialPlayer.recoverAction")}
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
};

export default InitialPlayerDialog;
