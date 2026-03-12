import { faHouse, faTrophy, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NavLink from "./NavLink";

const Navbar = () => {
  return (
    <header className="w-full justify-between border-b border-neutral-300 py-2 sm:py-5 flex">
      <h1 className="text-center text-3xl max-sm:text-xl font-black tracking-[0.28em] text-black">
        WORDLE
      </h1>
      <nav>
        <ul className="mt-2 flex items-center justify-center gap-4 max-sm:gap-1 text-sm font-medium text-neutral-600">
          <li>
            <NavLink
              to="/"
              label="Home"
              icon={<FontAwesomeIcon icon={faHouse} aria-hidden="true" />}
            />
          </li>
          <li>
            <NavLink
              to="/profile"
              label="Profile"
              icon={<FontAwesomeIcon icon={faUser} aria-hidden="true" />}
            />
          </li>
          <li>
            <NavLink
              to="/scoreboard"
              label="Scoreboard"
              icon={<FontAwesomeIcon icon={faTrophy} aria-hidden="true" />}
            />
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
