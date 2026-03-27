import type { JSX } from "react";
import { usePlayer } from "@providers";
import {
  Toolbar,
  DialogsSection,
  BoardSection,
  KeyboardSection,
} from "./sections";
import { usePlayController, usePlaySections } from "./hooks";

const PlayContent = (): JSX.Element => {
  const controller = usePlayController();
  const { player } = usePlayer();
  const { toolbarProps, boardProps, keyboardProps, dialogsProps } =
    usePlaySections(controller, player);

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

const Play = (): JSX.Element => {
  return <PlayContent />;
};

export default Play;
