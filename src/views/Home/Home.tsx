import type { JSX } from "react";
import { HomeViewProvider } from "./providers";
import {
  Toolbar,
  DialogsSection,
  BoardSection,
  KeyboardSection,
} from "./sections";

const HomeContent = (): JSX.Element => {
  return (
    <>
      <DialogsSection />
      <main className="flex flex-1 flex-col">
        <section className="flex flex-1 flex-col items-center justify-start gap-6 max-sm:gap-2 py-6 max-sm:py-2">
          <Toolbar />
          <BoardSection />
        </section>

        <KeyboardSection />
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
