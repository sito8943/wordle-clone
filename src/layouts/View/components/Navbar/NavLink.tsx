import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavLink as RouterNavLink } from "react-router";
import type { NavLinkPropsType } from "./types";

const NavLink = ({
  to,
  label,
  icon,
  iconClassName,
  ariaLabel,
  extraLabel,
  toneClassName,
}: NavLinkPropsType) => {
  return (
    <RouterNavLink
      to={to}
      aria-label={ariaLabel ?? label}
      title={label}
      className={({ isActive }) =>
        [
          "inline-flex items-center gap-2 rounded px-2 py-1 transition-colors",
          toneClassName ??
            [
              isActive
                ? "bg-primary/10 text-primary"
                : "text-neutral-600 dark:text-neutral-300",
              "hover:bg-primary/10 hover:text-primary dark:hover:text-primary",
            ].join(" "),
        ].join(" ")
      }
    >
      {extraLabel && <span className="inline-flex items-center text-sm">{extraLabel}</span>}
      <FontAwesomeIcon
        icon={icon}
        aria-hidden="true"
        className={iconClassName ?? "text-lg"}
      />
      <span className="hidden text-sm sm:inline">{label}</span>
    </RouterNavLink>
  );
};

export default NavLink;
