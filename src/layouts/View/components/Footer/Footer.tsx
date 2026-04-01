import { useEffect, useState } from "react";
import { useTranslation } from "@i18n";
import {
  FOOTER_GITHUB_REPOSITORY_URL,
  FOOTER_PORTFOLIO_URL,
  SCROLL_VISIBILITY_THRESHOLD,
} from "./constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaypal, faGithub } from "@fortawesome/free-brands-svg-icons";

type FooterProps = {
  alwaysVisible?: boolean;
};

const Footer = ({ alwaysVisible = false }: FooterProps) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (alwaysVisible) {
      setIsVisible(true);
      return;
    }

    const handleScroll = () => {
      const nextVisible = window.scrollY > SCROLL_VISIBILITY_THRESHOLD;

      setIsVisible((previous) =>
        previous === nextVisible ? previous : nextVisible,
      );
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [alwaysVisible]);

  const footerVisible = alwaysVisible || isVisible;

  return (
    <footer
      className={`fixed inset-x-0 bottom-0 z-30 px-3 pb-3 transition-all duration-200 ${
        footerVisible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-full opacity-0"
      }`}
    >
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3 rounded-lg border border-neutral-300 bg-neutral-100/95 px-4 py-2 text-sm text-neutral-800 shadow-lg backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/95 dark:text-neutral-200">
        <a
          href={FOOTER_PORTFOLIO_URL}
          target="_blank"
          rel="noreferrer"
          className="underline decoration-neutral-400 underline-offset-4 hover:decoration-current"
        >
          {t("footer.madeBy")}
        </a>
        <div className="flex gap-1">
           <a
            href={FOOTER_GITHUB_REPOSITORY_URL}
            target="_blank"
            rel="noreferrer"
            aria-label={t("footer.githubRepository")}
            className="flex items-center text-xl rounded-full p-1 text-neutral-700 transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 dark:text-neutral-300 dark:hover:text-white dark:focus-visible:outline-neutral-300"
          >
            <FontAwesomeIcon icon={faGithub} />
          </a>
          <a
            href="https://www.paypal.com/donate/?hosted_button_id=TGFCRW9NBTJZY"
            target="_blank"
            rel="noreferrer"
            className="rounded-full flex items-center bg-paypal px-1.5 p-1 text-white transition-colors hover:bg-paypal/55"
          >
            <FontAwesomeIcon icon={faPaypal} />
          </a>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
