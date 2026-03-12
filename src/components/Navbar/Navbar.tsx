import { faHouse, faTrophy, faUser } from "@fortawesome/free-solid-svg-icons";
import NavLink from "./NavLink";

const links = [
  { to: "/", label: "Home", icon: faHouse },
  { to: "/profile", label: "Profile", icon: faUser },
  { to: "/scoreboard", label: "Scoreboard", icon: faTrophy },
];

const Navbar = () => {
  return (
    <header className="w-full items-center justify-between border-b border-neutral-300 py-2 sm:py-3 flex">
      <h1 className="text-center text-3xl max-sm:text-xl font-black tracking-[0.28em] text-black">
        WORDLE
      </h1>
      <nav>
        <ul className="m-auto flex items-center justify-center gap-4 max-sm:gap-1 text-sm font-medium text-neutral-600">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} label={link.label} icon={link.icon} />
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
