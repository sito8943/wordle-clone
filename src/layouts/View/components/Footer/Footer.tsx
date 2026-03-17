import { useEffect, useState } from "react";
import {
  FOOTER_COPYRIGHT_LABEL,
  FOOTER_GITHUB_ARIA_LABEL,
  FOOTER_GITHUB_REPOSITORY_URL,
  FOOTER_PORTFOLIO_URL,
  SCROLL_VISIBILITY_THRESHOLD,
} from "./constants";

const Footer = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > SCROLL_VISIBILITY_THRESHOLD);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <footer
      className={`fixed inset-x-0 bottom-0 z-30 px-3 pb-3 transition-all duration-200 ${
        isVisible
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
          {FOOTER_COPYRIGHT_LABEL}
        </a>
        <a
          href={FOOTER_GITHUB_REPOSITORY_URL}
          target="_blank"
          rel="noreferrer"
          aria-label={FOOTER_GITHUB_ARIA_LABEL}
          className="rounded p-1 text-neutral-700 transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 dark:text-neutral-300 dark:hover:text-white dark:focus-visible:outline-neutral-300"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="currentColor"
          >
            <path d="M12 0a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.03c-3.33.72-4.03-1.4-4.03-1.4-.55-1.39-1.34-1.77-1.34-1.77-1.1-.74.08-.72.08-.72 1.21.09 1.85 1.23 1.85 1.23 1.08 1.83 2.82 1.3 3.5.99.1-.77.42-1.3.76-1.6-2.66-.3-5.47-1.32-5.47-5.86 0-1.29.46-2.35 1.22-3.18-.12-.3-.53-1.5.12-3.13 0 0 1-.32 3.29 1.22a11.5 11.5 0 0 1 6 0c2.29-1.54 3.29-1.22 3.29-1.22.65 1.63.24 2.83.12 3.13.76.83 1.22 1.89 1.22 3.18 0 4.55-2.81 5.55-5.49 5.85.43.37.82 1.1.82 2.23v3.3c0 .32.22.7.83.58A12 12 0 0 0 12 0Z" />
          </svg>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
