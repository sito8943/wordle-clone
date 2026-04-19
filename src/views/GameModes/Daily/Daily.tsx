import { WORDLE_MODE_IDS } from "@domain/wordle";
import Play from "@views/Play";

const Daily = () => {
  return <Play modeId={WORDLE_MODE_IDS.DAILY} />;
};

export default Daily;
