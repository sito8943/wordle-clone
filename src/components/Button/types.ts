import type { IconProp } from "@fortawesome/fontawesome-svg-core";

export type ButtonVariant = "solid" | "outline" | "ghost";
export type ButtonColor =
  | "primary"
  | "secondary"
  | "neutral"
  | "danger"
  | "warning"
  | "info"
  | "success";

export type ButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "color"
> & {
  variant?: ButtonVariant;
  color?: ButtonColor;
  icon?: IconProp;
  iconClassName?: string;
  hideLabelOnMobile?: boolean;
};
