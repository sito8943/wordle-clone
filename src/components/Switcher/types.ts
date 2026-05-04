export type SwitcherProps = {
  id?: string;
  name?: string;
  checked: boolean;
  disabled?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  tabIndex?: number;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  onClick?: React.MouseEventHandler<HTMLInputElement>;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  className?: string;
};

export type SwitcherFieldProps = Omit<SwitcherProps, "id" | "className"> & {
  id: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  switcherClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
};
