import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router";
import type { NavLinkPropsType } from "./types";

const NavLink = ({ to, label, icon }: NavLinkPropsType) => {
  return (
    <Link
      to={to}
      aria-label={label}
      title={label}
      className="inline-flex items-center gap-2 rounded px-2 py-1 hover:text-neutral-900 hover:bg-neutral-200"
    >
      <FontAwesomeIcon icon={icon} aria-hidden="true" />
      <span className="hidden text-sm sm:inline">{label}</span>
    </Link>
  );
};

export default NavLink;
