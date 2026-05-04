import type { SwitcherProps } from "./types";

const Switcher = ({
  id,
  name,
  className,
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
}: SwitcherProps) => {
  const wrapperClassName = [
    "relative inline-flex h-5 w-10 shrink-0 items-center",
    disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const inputClassName = [
    "peer absolute inset-0 m-0 h-full w-full opacity-0",
    disabled ? "cursor-not-allowed" : "cursor-pointer",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <label className={wrapperClassName}>
      <input
        type="checkbox"
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
        className={inputClassName}
      />
      <span
        aria-hidden="true"
        className="h-full w-full rounded-full border border-neutral-400 bg-neutral-200 transition-colors duration-200 dark:border-neutral-600 dark:bg-neutral-700 peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-neutral-100 dark:peer-focus-visible:ring-offset-neutral-900"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 peer-checked:translate-x-5 dark:bg-neutral-100"
      />
    </label>
  );
};

export default Switcher;
