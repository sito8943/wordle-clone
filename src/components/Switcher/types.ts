export type SwitcherProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  checked: boolean;
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
