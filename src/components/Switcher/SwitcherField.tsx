import Switcher from "./Switcher";
import type { SwitcherFieldProps } from "./types";

const SwitcherField = ({
  id,
  label,
  description,
  className,
  switcherClassName = "mt-1",
  labelClassName = "profile-field-label",
  descriptionClassName = "text-xs text-neutral-600 dark:text-neutral-300",
  ...switcherProps
}: SwitcherFieldProps) => {
  const fieldClassName = ["flex items-start gap-3", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={fieldClassName}>
      <Switcher id={id} className={switcherClassName} {...switcherProps} />
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
