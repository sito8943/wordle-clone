import type { ProfileCardPropsTypes } from "./types";
import {
  PROFILE_CODE_HELP,
  PROFILE_CODE_LABEL,
  PROFILE_NAME_LABEL,
  PROFILE_SCORE_LABEL,
} from "../constants";

const ProfileCard = (props: ProfileCardPropsTypes) => {
  return (
    <div className="profile-card-container">
      <div className="profile-card-field-row">
        <label htmlFor="name">{PROFILE_NAME_LABEL}</label>
        <input
          className="profile-card-field-input"
          id="name"
          type="text"
          value={props.name}
          readOnly
        />
      </div>
      <div className="profile-card-field-row">
        <label htmlFor="score">{PROFILE_SCORE_LABEL}</label>
        <input
          className="profile-card-field-input"
          id="score"
          type="number"
          value={props.score}
          readOnly
        />
      </div>
      <div className="profile-card-field-row">
        <label htmlFor="code">{PROFILE_CODE_LABEL}</label>
        <input
          className="profile-card-field-input"
          id="code"
          type="text"
          value={props.code}
          readOnly
        />
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-300">
        {PROFILE_CODE_HELP}
      </p>
    </div>
  );
};

export default ProfileCard;
