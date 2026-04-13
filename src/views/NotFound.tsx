import { Link } from "react-router";
import { useTranslation } from "@i18n";
import { Button } from "@components";
import { ROUTES } from "@config/routes";

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <main className="page-centered gap-10">
      <h2 className="page-title">{t("notFound.title")}</h2>
      <p className="mt-2 text-base text-neutral-600">
        {t("notFound.description")}
      </p>
      <Button>
        <Link to={ROUTES.HOME}>{t("notFound.action")}</Link>
      </Button>
    </main>
  );
};

export default NotFound;
