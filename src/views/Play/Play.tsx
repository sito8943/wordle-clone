import type { JSX } from "react";
import {
  Toolbar,
  DialogsSection,
  BoardSection,
  KeyboardSection,
} from "./sections";
import { PlayViewProvider } from "./providers";

const PlayContent = (): JSX.Element => {
  return (
    <>
      <DialogsSection />
      <main id="play" className="flex flex-1 flex-col">
        <section id='board' className="flex flex-1 flex-col items-center justify-start gap-2 max-sm:gap-2 py-2">
          <Toolbar />
          <BoardSection />
        </section>

        <KeyboardSection />
      </main>
    </>
  );
};

const Play = (): JSX.Element => {
  return (
    <PlayViewProvider>
      <PlayContent />
    </PlayViewProvider>
  );
};

export default Play;
