import { useTranslation } from "@i18n";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { EndOfGameWordSectionProps } from "./types";

const EndOfGameWordSection = ({
  answer,
  sectionClassName,
}: EndOfGameWordSectionProps) => {
  const { t } = useTranslation();

  return (
    <section className={sectionClassName}>
      <p className="text-xs font-semibold uppercase tracking-[0.24em]">
        {t("play.endOfGame.wordLabel")}
      </p>
      <div className="mt-2 flex">
        <p className="text-3xl font-black tracking-[0.18em]">{answer}</p>
        <a
          href={`https://google.com/search?q=define+%22${answer}%22`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary"
        >
          <FontAwesomeIcon icon={faInfoCircle} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
};

export default EndOfGameWordSection;
