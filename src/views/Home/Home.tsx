import type { JSX } from "react";
import HomeBoardSection from "./HomeBoardSection";
import HomeDialogs from "./HomeDialogs";
import HomeKeyboardSection from "./HomeKeyboardSection";
import HomeToolbar from "./HomeToolbar";
import { HomeViewProvider } from "./HomeViewProvider";

const HomeContent = (): JSX.Element => {
  return (
    <>
      <HomeDialogs />
      <main className="flex flex-1 flex-col">
        <section className="flex flex-1 flex-col items-center justify-start gap-6 max-sm:gap-2 py-6 max-sm:py-2">
          <HomeToolbar />
          <HomeBoardSection />
        </section>

        <HomeKeyboardSection />
      </main>
    </>
  );
};

const Home = (): JSX.Element => {
  return (
    <HomeViewProvider>
      <HomeContent />
    </HomeViewProvider>
  );
};

export default Home;
