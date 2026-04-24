import { WORDLE_MODE_IDS } from "@domain/wordle";
import { useDailyModePrerequisites } from "@hooks/useDailyModePrerequisites";
import { i18n } from "@i18n";
import ModeGatePlaceholder from "@views/Play/components/ModeGatePlaceholder";
import Play from "@views/Play";

const Daily = () => {
  const { status } = useDailyModePrerequisites();
  const modeName = i18n.t("gameModes.modes.daily.name");

  if (status === "ready") {
    return <Play modeId={WORDLE_MODE_IDS.DAILY} />;
  }

  return (
    <ModeGatePlaceholder
      modeId={WORDLE_MODE_IDS.DAILY}
      title={i18n.t("play.modeGate.dailyRequirementsTitle", { mode: modeName })}
      description={
        status === "loading"
          ? i18n.t("play.modeGate.dailyRequirementsLoading")
          : i18n.t("play.modeGate.dailyRequirementsDescription")
      }
    />
  );
};

export default Daily;
