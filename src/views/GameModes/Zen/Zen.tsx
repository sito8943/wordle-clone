import { Button } from "@components";
import { ROUTES } from "@config/routes";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

const Zen = () => {
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

export default Zen;
