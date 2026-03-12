import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type ButtonVariant = "solid" | "outline" | "ghost";
type ButtonColor = "primary" | "secondary" | "neutral";

type ButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "color"
> & {
  variant?: ButtonVariant;
  color?: ButtonColor;
  icon?: IconProp;
  hideLabelOnMobile?: boolean;
};

const BASE_STYLE =
  "inline-flex items-center justify-center gap-2 rounded px-4 py-2 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-100 disabled:cursor-not-allowed disabled:opacity-50";

const STYLE_BY_VARIANT: Record<ButtonVariant, Record<ButtonColor, string>> = {
  solid: {
    primary: "bg-primary text-white hover:bg-primary/90 focus-visible:ring-primary",
    secondary:
      "bg-secondary text-white hover:bg-secondary/90 focus-visible:ring-secondary",
    neutral:
      "bg-neutral-900 text-white hover:bg-neutral-700 focus-visible:ring-neutral-500",
  },
  outline: {
    primary: "border border-primary text-primary hover:bg-primary/10 focus-visible:ring-primary",
    secondary:
      "border border-secondary text-secondary hover:bg-secondary/10 focus-visible:ring-secondary",
    neutral:
      "border border-neutral-300 text-neutral-800 hover:bg-neutral-100 focus-visible:ring-neutral-500",
  },
  ghost: {
    primary: "text-primary hover:bg-primary/10 focus-visible:ring-primary",
    secondary: "text-secondary hover:bg-secondary/10 focus-visible:ring-secondary",
    neutral: "text-neutral-800 hover:bg-neutral-100 focus-visible:ring-neutral-500",
  },
};

const Button = ({
  type = "button",
  variant = "solid",
  color = "primary",
  icon,
  hideLabelOnMobile = false,
  className,
  children,
  ...props
}: ButtonProps) => {
  const classes = [BASE_STYLE, STYLE_BY_VARIANT[variant][color], className]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} {...props}>
      {icon ? <FontAwesomeIcon icon={icon} aria-hidden="true" /> : null}
      {children ? (
        <span className={hideLabelOnMobile ? "max-sm:hidden" : undefined}>
          {children}
        </span>
      ) : null}
    </button>
  );
};

export default Button;
