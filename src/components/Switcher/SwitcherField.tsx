import Switcher from "./Switcher";
import type { SwitcherFieldProps } from "./types";

const SwitcherField = ({
  id,
  name,
  checked,
  disabled,
  required,
  autoFocus,
  tabIndex,
  onChange,
  onBlur,
  onFocus,
  onKeyDown,
  onClick,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  label,
  description,
  className,
  switcherClassName = "mt-1",
  labelClassName = "profile-field-label",
  descriptionClassName = "text-xs text-neutral-600 dark:text-neutral-300",
}: SwitcherFieldProps) => {
  const fieldClassName = ["flex items-start gap-3", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={fieldClassName}>
      <Switcher
        id={id}
        name={name}
        checked={checked}
        disabled={disabled}
        required={required}
        autoFocus={autoFocus}
        tabIndex={tabIndex}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        onClick={onClick}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        className={switcherClassName}
      />
      <div>
        <label htmlFor={id} className={labelClassName}>
          {label}
        </label>
        {description ? (
          <p className={descriptionClassName}>{description}</p>
        ) : null}
      </div>
    </div>
  );
};

export default SwitcherField;
