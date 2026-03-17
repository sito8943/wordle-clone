import type { ProfileCardPropsTypes } from "./types";
import { PROFILE_NAME_LABEL, PROFILE_SCORE_LABEL } from "../constants";

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
    </div>
  );
};

export default ProfileCard;
