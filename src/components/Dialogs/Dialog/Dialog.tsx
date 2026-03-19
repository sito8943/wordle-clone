import { useEffect, type JSX } from "react";
import { createPortal } from "react-dom";
import type { DialogProps } from "./types";
import { joinClassNames } from "./utils";
import { Button } from "@components/Button";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useDialogCloseTransition from "../useDialogCloseTransition";
import {
  DIALOG_CLOSE_DURATION_MS,
  getDialogTransitionClasses,
} from "../ConfirmationDialog";

const Dialog = ({
  visible,
  onClose,
  isClosing: controlledIsClosing = false,
  titleId,
  title,
  description,
  children,
  headerAction,
  panelClassName,
  zIndexClassName = "z-20",
  backdropAnimationClassName: customBackdropAnimationClassName,
  panelAnimationClassName: customPanelAnimationClassName,
}: DialogProps): JSX.Element | null => {
  const { isClosing: internalIsClosing, closeWithAction } =
    useDialogCloseTransition(
    DIALOG_CLOSE_DURATION_MS,
  );
  const isClosing = controlledIsClosing || internalIsClosing;

  const { backdropAnimationClassName, panelAnimationClassName } =
    getDialogTransitionClasses(isClosing);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      closeWithAction(onClose);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeWithAction, onClose, visible]);

  if (!visible || typeof document === "undefined") {
    return null;
  }

  const backdropClassName = joinClassNames(
    "dialog-backdrop",
    zIndexClassName,
    customBackdropAnimationClassName ?? backdropAnimationClassName,
  );
  const panelClassNameWithAnimations = joinClassNames(
    "dialog-panel",
    panelClassName,
    customPanelAnimationClassName ?? panelAnimationClassName,
  );

  return createPortal(
    <div className={backdropClassName} onClick={() => closeWithAction(onClose)}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={panelClassNameWithAnimations}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <div
          className={
            headerAction
              ? "flex flex-wrap items-start justify-between gap-3"
              : ""
          }
        >
          <div>
            <h2 id={titleId} className="dialog-title">
              {title}
            </h2>
            {description ? (
              <p className="dialog-description">{description}</p>
            ) : null}
          </div>
          {headerAction ?? (
            <Button
              onClick={() => closeWithAction(onClose)}
              variant="ghost"
              color="danger"
              className="absolute top-2 right-2"
              disabled={isClosing}
              aria-label="Close"
            >
              <FontAwesomeIcon icon={faClose} />
            </Button>
          )}
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
};

export default Dialog;
