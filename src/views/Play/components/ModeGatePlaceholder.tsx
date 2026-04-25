import type { JSX } from "react";
import { Link } from "react-router";
import { Button } from "@components";
import { ROUTES } from "@config/routes";
import { useTranslation } from "@i18n";
import type { WordleModeId } from "@domain/wordle";

const ModeGatePlaceholder = ({
  modeId,
  title,
  description,
}: {
  modeId: WordleModeId;
  title?: string;
  description?: string;
}): JSX.Element => {
  const { t } = useTranslation();
  const modeName = t(`gameModes.modes.${modeId}.name`);
  const resolvedTitle = title ?? t("play.modeGate.title", { mode: modeName });
  const resolvedDescription = description ?? t("play.modeGate.description");

  return (
    <main
      data-testid="play-mode-gate-placeholder"
      className="page-centered gap-10 px-4"
    >
      <h2 className="page-title text-center">{resolvedTitle}</h2>
      <p className="max-w-xl text-center text-base text-neutral-600 dark:text-neutral-300">
        {resolvedDescription}
      </p>
      <Button>
        <Link to={ROUTES.CLASSIC}>{t("play.modeGate.classicAction")}</Link>
      </Button>
    </main>
  );
};

export default ModeGatePlaceholder;
