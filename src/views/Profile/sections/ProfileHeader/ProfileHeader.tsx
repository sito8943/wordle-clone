import { useTranslation } from "@i18n";

const ProfileHeader = () => {
  const { t } = useTranslation();

  return (
    <div className="flex gap-4 items-center flex-wrap justify-center">
      <h2 className="page-title">{t("profile.pageTitle")}</h2>
    </div>
  );
};

export default ProfileHeader;
