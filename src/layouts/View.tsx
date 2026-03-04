import { Outlet } from "react-router";

const View = () => {
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-3 py-3 sm:px-4 sm:py-4">
        <header className="border-b border-neutral-300 py-4 text-center text-3xl font-black tracking-[0.28em] text-black sm:py-5">
          WORDLE
        </header>

        <Outlet />
      </div>
    </div>
  );
};

export default View;
