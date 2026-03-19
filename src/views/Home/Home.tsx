import type { JSX } from "react";
import { usePlayer } from "@providers";
import {
  Toolbar,
  DialogsSection,
  BoardSection,
  KeyboardSection,
} from "./sections";
import { useHomeController, useHomeSections } from "./hooks";

const HomeContent = (): JSX.Element => {
  const controller = useHomeController();
  const { player } = usePlayer();
  const { toolbarProps, boardProps, keyboardProps, dialogsProps } =
    useHomeSections(controller, player);

  return (
    <>
      <DialogsSection {...dialogsProps} />
      <main className="flex flex-1 flex-col">
        <section className="flex flex-1 flex-col items-center justify-start gap-6 max-sm:gap-2 py-6 max-sm:py-2">
          <Toolbar {...toolbarProps} />
          <BoardSection {...boardProps} />
        </section>

        <KeyboardSection {...keyboardProps} />
      </main>
    </>
  );
};

const Home = (): JSX.Element => {
  return <HomeContent />;
};

export default Home;
