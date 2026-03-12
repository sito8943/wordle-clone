import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavLink as RouterNavLink } from "react-router";
import type { NavLinkPropsType } from "./types";

const NavLink = ({ to, label, icon }: NavLinkPropsType) => {
  return (
    <RouterNavLink
      to={to}
      aria-label={label}
      title={label}
      className={({ isActive }) =>
        [
          "inline-flex items-center gap-2 rounded px-2 py-1 transition-colors",
          isActive ? "bg-primary/10 text-primary" : "text-neutral-600",
          "hover:bg-primary/10 hover:text-primary",
        ].join(" ")
      }
    >
      <FontAwesomeIcon icon={icon} aria-hidden="true" className="text-lg" />
      <span className="hidden text-sm sm:inline">{label}</span>
    </RouterNavLink>
  );
};

export default NavLink;
