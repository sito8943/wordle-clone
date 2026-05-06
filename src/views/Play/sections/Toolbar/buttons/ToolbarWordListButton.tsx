import type { JSX } from "react";
import { faList } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@components";
import { useTranslation } from "@i18n";
import { usePlayView } from "@views/Play/providers";
import {
  TOOLBAR_COMPACT_BUTTON_CLASS_NAME,
  TOOLBAR_ICON_CLASS_NAME,
} from "./constants";

const ToolbarWordListButton = (): JSX.Element | null => {
  const { t } = useTranslation();
  const { controller, wordListButtonEnabled } = usePlayView();
  const { openWordsDialog, dictionaryLoading, dictionaryWords } = controller;

  if (!wordListButtonEnabled) {
    return null;
  }

  return (
    <Button
      onClick={openWordsDialog}
      aria-label={t("play.toolbar.wordListAriaLabel")}
      variant="ghost"
      icon={faList}
      iconClassName={TOOLBAR_ICON_CLASS_NAME}
      className={TOOLBAR_COMPACT_BUTTON_CLASS_NAME}
      hideLabelOnMobile
      disabled={dictionaryLoading || dictionaryWords.length === 0}
    >
      {t("play.toolbar.wordListButton")}
    </Button>
  );
};

export default ToolbarWordListButton;
