import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type IconButtonProps = {
  ariaLabel: string;
  label: string;
  icon: IconProp;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  hideLabelOnMobile?: boolean;
};

const IconButton = ({
  ariaLabel,
  label,
  icon,
  onClick,
  className,
  hideLabelOnMobile = false,
}: IconButtonProps) => {
  const classes = [
    "inline-flex items-center gap-2 rounded bg-neutral-900 px-4 py-2 text-white hover:bg-neutral-700",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type="button" onClick={onClick} aria-label={ariaLabel} className={classes}>
      <FontAwesomeIcon icon={icon} aria-hidden="true" />
      <span className={hideLabelOnMobile ? "max-sm:hidden" : undefined}>
        {label}
      </span>
    </button>
  );
};

export default IconButton;
