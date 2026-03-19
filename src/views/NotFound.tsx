import { Link } from "react-router";
import { useTranslation } from "@i18n";

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <main className="page-centered">
      <h2 className="page-title">{t("notFound.title")}</h2>
      <p className="mt-2 text-base text-neutral-600">
        {t("notFound.description")}
      </p>
      <Link to="/" className="text-blue-500 hover:text-blue-700">
        {t("notFound.action")}
      </Link>
    </main>
  );
};

export default NotFound;
