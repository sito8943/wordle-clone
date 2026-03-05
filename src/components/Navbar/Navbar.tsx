import NavLink from "./NavLink";

const Navbar = () => {
  return (
    <header className="w-full justify-between border-b border-neutral-300 py-4 sm:py-5 flex">
      <h1 className="text-center text-3xl font-black tracking-[0.28em] text-black">
        WORDLE
      </h1>
      <nav>
        <ul className="mt-2 flex items-center justify-center gap-4 text-sm font-medium text-neutral-600">
          <li>
            <NavLink to="/">Home</NavLink>
          </li>
          <li>
            <NavLink to="/profile">Profile</NavLink>
          </li>
          <li>
            <NavLink to="/scoreboard">Scoreboard</NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
