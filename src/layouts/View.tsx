import { Outlet } from "react-router";
import { Navbar } from "../components";

const View = () => {
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900">
      <div className="mx-auto flex min-h-screen w-full flex-col max-sm:p-3 p-1">
        <Navbar />
        <Outlet />
      </div>
    </div>
  );
};

export default View;
