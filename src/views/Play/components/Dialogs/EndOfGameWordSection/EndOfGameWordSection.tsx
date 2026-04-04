import { useTranslation } from "@i18n";
import { faInfoCircle, faThumbsDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { env } from "@config/env";
import { useFeatureFlags } from "@providers/FeatureFlags";
import type { EndOfGameWordSectionProps } from "./types";

const EndOfGameWordSection = ({
  answer,
  sectionClassName,
}: EndOfGameWordSectionProps) => {
  const { t } = useTranslation();
  const { wordReportButtonEnabled } = useFeatureFlags();
  const reportText = t("play.endOfGame.invalidWordReport");
  const reportPhone = env.wordReportPhoneNumber?.replace(/\D/g, "");
  const reportHref = reportPhone
    ? `https://wa.me/${reportPhone}?text=${encodeURIComponent(
        `${reportText}: ${answer}`,
      )}`
    : undefined;

  return (
    <section className={sectionClassName}>
      <p className="text-xs font-semibold uppercase tracking-[0.24em]">
        {t("play.endOfGame.wordLabel")}
      </p>
      <div className="mt-2 flex gap-2">
        <p className="text-3xl font-black tracking-[0.18em]">{answer}</p>
        <a
          href={`https://google.com/search?q=define+%22${answer}%22`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary text-xl"
        >
          <FontAwesomeIcon icon={faInfoCircle} aria-hidden="true" />
        </a>
        {wordReportButtonEnabled ? (
          <a
            href={reportHref}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-primary text-xl ${!reportHref ? "pointer-events-none opacity-40" : ""}`}
            aria-disabled={!reportHref}
            title={reportText}
          >
            <FontAwesomeIcon icon={faThumbsDown} aria-hidden="true" />
          </a>
        ) : null}
      </div>
    </section>
  );
};

export default EndOfGameWordSection;
