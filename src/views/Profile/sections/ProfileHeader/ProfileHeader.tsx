import { Button } from "@components";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "@i18n";
import { useNavigate } from "react-router";

const ProfileHeader = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex gap-4 items-center flex-wrap justify-center">
      <Button
        variant="ghost"
        color="neutral"
        icon={faChevronLeft}
        onClick={() => {
          navigate(-1);
        }}
        className="px-1!"
      ></Button>
      <h2 className="page-title">{t("profile.pageTitle")}</h2>
    </div>
  );
};

export default ProfileHeader;
