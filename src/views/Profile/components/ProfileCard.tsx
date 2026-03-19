import { useTranslation } from "@i18n";
import type { ProfileCardPropsTypes } from "./types";

const ProfileCard = (props: ProfileCardPropsTypes) => {
  const { t } = useTranslation();

  return (
    <div className="profile-section profile-card-container">
      <div className="profile-card-field-row">
        <label htmlFor="name" className="profile-field-label">
          {t("profile.labels.name")}
        </label>
        <input
          className="profile-card-field-input"
          id="name"
          type="text"
          value={props.name}
          readOnly
        />
      </div>
      <div className="profile-card-field-row">
        <label htmlFor="score" className="profile-field-label">
          {t("profile.labels.score")}
        </label>
        <input
          className="profile-card-field-input"
          id="score"
          type="number"
          value={props.score}
          readOnly
        />
      </div>
      <div className="profile-card-field-row">
        <label htmlFor="code" className="profile-field-label">
          {t("profile.labels.code")}
        </label>
        <input
          className="profile-card-field-input"
          id="code"
          type="text"
          value={props.code}
          readOnly
        />
      </div>
      <p className="profile-help-text">{t("profile.codeHelp")}</p>
    </div>
  );
};

export default ProfileCard;
