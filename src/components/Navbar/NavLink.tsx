import { Link } from "react-router";
import type { NavLinkPropsType } from "./types";

const NavLink = (props: NavLinkPropsType) => {
  return (
    <Link to={props.to} className="hover:text-neutral-900">
      {props.children}
    </Link>
  );
};

export default NavLink;
