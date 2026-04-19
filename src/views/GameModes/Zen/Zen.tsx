import { WORDLE_MODE_IDS } from "@domain/wordle";
import Play from "@views/Play";

const Zen = () => {
  return <Play modeId={WORDLE_MODE_IDS.ZEN} />;
};

export default Zen;
