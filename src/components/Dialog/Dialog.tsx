import type { JSX } from "react";
import type { DialogProps } from "./types";

const joinClassNames = (...classNames: Array<string | undefined>): string => {
  return classNames.filter(Boolean).join(" ");
};

const Dialog = ({
  titleId,
  title,
  description,
  children,
  headerAction,
  panelClassName,
  zIndexClassName = "z-20",
  backdropAnimationClassName,
  panelAnimationClassName,
}: DialogProps): JSX.Element => {
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

  return (
    <div className={backdropClassName}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={panelClassNameWithAnimations}
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
    </div>
  );
};

export default Dialog;
