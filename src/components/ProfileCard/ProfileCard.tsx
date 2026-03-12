import type { ProfileCardPropsTypes } from "./types";

const ProfileCard = (props: ProfileCardPropsTypes) => {
  return (
    <div className="profile-card-container">
      <div className="profile-card-field-row">
        <label htmlFor="name">Name:</label>
        <input
          className="profile-card-field-input"
          id="name"
          type="text"
          value={props.name}
          readOnly
        />
      </div>
      <div className="profile-card-field-row">
        <label htmlFor="score">Score:</label>
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
