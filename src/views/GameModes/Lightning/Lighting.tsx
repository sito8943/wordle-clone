import { WORDLE_MODE_IDS } from "@domain/wordle";
import Play from "@views/Play";

const Lighting = () => {
  return <Play modeId={WORDLE_MODE_IDS.LIGHTNING} />;
};

export default Lighting;
