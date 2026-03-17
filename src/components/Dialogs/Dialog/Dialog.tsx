import { useEffect, type JSX } from "react";
import { createPortal } from "react-dom";
import type { DialogProps } from "./types";
import { joinClassNames } from "./utils";

const Dialog = ({
  visible,
  onClose,
  titleId,
  title,
  description,
  children,
  headerAction,
  panelClassName,
  zIndexClassName = "z-20",
  backdropAnimationClassName,
  panelAnimationClassName,
}: DialogProps): JSX.Element | null => {
  useEffect(() => {
    if (!visible) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, visible]);

  if (!visible || typeof document === "undefined") {
    return null;
  }

  const backdropClassName = joinClassNames(
    "dialog-backdrop",
    zIndexClassName,
    backdropAnimationClassName,
  );
  const panelClassNameWithAnimations = joinClassNames(
    "dialog-panel",
    panelClassName,
    panelAnimationClassName,
  );

  return createPortal(
    <div className={backdropClassName} onClick={onClose}>
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
          {headerAction}
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
};

export default Dialog;
