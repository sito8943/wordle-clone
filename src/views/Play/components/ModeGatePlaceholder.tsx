import type { JSX } from "react";
import { Link } from "react-router";
import { Button } from "@components";
import { ROUTES } from "@config/routes";
import { useTranslation } from "@i18n";
import type { WordleModeId } from "@domain/wordle";

const ModeGatePlaceholder = ({
  modeId,
}: {
  modeId: WordleModeId;
}): JSX.Element => {
  const { t } = useTranslation();
  const modeName = t(`gameModes.modes.${modeId}.name`);

  return (
    <main
      data-testid="play-mode-gate-placeholder"
      className="page-centered gap-10 px-4"
    >
      <h2 className="page-title text-center">
        {t("play.modeGate.title", { mode: modeName })}
      </h2>
      <p className="max-w-xl text-center text-base text-neutral-600 dark:text-neutral-300">
        {t("play.modeGate.description")}
      </p>
      <Button>
        <Link to={ROUTES.CLASSIC}>{t("play.modeGate.classicAction")}</Link>
      </Button>
    </main>
  );
};

export default ModeGatePlaceholder;
