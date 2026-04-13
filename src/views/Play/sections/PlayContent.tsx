import type { JSX } from "react";
import BoardSection from "./BoardSection/BoardSection";
import DialogsSection from "./DialogsSection";
import KeyboardSection from "./KeyboardSection";
import Toolbar from "./Toolbar/Toolbar";

export const PlayContent = (): JSX.Element => {
  return (
    <>
      <DialogsSection />
      <main id="play" className="flex flex-1 flex-col">
        <section
          id="board"
          className="flex flex-1 flex-col items-center justify-start gap-2 max-sm:gap-2 py-2"
        >
          <Toolbar />
          <BoardSection />
        </section>

        <KeyboardSection />
      </main>
    </>
  );
};
