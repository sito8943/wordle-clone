import { Button } from "@components";
import { useTranslation } from "@i18n";
import { useProfileView } from "@views/Profile/providers";

const ProfileHeader = () => {
  const { t } = useTranslation();
  const {
    controller: { editing, toggleEditing },
  } = useProfileView();

  return (
    <div className="flex gap-4 items-center flex-wrap justify-center">
      <h2 className="page-title">{t("profile.pageTitle")}</h2>
      <Button onClick={toggleEditing}>
        {editing ? t("profile.cancelAction") : t("profile.editAction")}
      </Button>
    </div>
  );
};

export default ProfileHeader;
