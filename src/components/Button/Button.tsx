import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { cn } from "@utils/cn";
import type { ButtonProps } from "./types";
import { BASE_STYLE, STYLE_BY_VARIANT } from "./constants";

const Button = ({
  type = "button",
  variant = "solid",
  color = "primary",
  icon,
  hideLabelOnMobile = false,
  iconClassName = "",
  className,
  children,
  ...props
}: ButtonProps) => {
  const classes = cn(BASE_STYLE, STYLE_BY_VARIANT[variant][color], className);

  return (
    <button type={type} className={classes} {...props}>
      {icon ? (
        <FontAwesomeIcon
          icon={icon}
          aria-hidden="true"
          className={iconClassName}
        />
      ) : null}
      {children ? (
        <span className={hideLabelOnMobile ? "max-sm:hidden" : undefined}>
          {children}
        </span>
      ) : null}
    </button>
  );
};

export default Button;
