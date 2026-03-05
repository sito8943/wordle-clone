import type { ProfileCardPropsTypes } from "./types";

const ProfileCard = (props: ProfileCardPropsTypes) => {
  return (
    <div className="flex flex-col gap-4 border border-gray-300 rounded-lg p-4 w-full max-w-sm">
      <div className="flex gap-2 items-center">
        <label htmlFor="name">Name:</label>
        <input className="border border-gray-300 rounded px-2 py-1" id="name" type="text" value={props.name} readOnly />
      </div>
      <div className="flex gap-2 items-center">
        <label htmlFor="score">Score:</label>
        <input className="border border-gray-300 rounded px-2 py-1" id="score" type="number" value={props.score} readOnly />
      </div>
    </div>
  );
};

export default ProfileCard;
