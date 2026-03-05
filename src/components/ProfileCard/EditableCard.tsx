import { useState, useEffect } from "react";
import type { EditableProfileCardPropsTypes } from "./types";

const EditableProfileCard = (props: EditableProfileCardPropsTypes) => {
  const [name, setName] = useState(props.name);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    props.onSubmit(name);
  };

  useEffect(() => {
    setName(props.name);
  }, [props.name, props.score]);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 border border-gray-300 rounded-lg p-4 w-full max-w-sm"
    >
      <div className="flex gap-2 items-center">
        <label htmlFor="name">Name:</label>
        <input
          className="border border-gray-300 rounded px-2 py-1"
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="flex gap-2 items-center">
        <label htmlFor="score">Score:</label>
        <input
          className="border border-gray-300 rounded px-2 py-1"
          id="score"
          type="number"
          value={props.score}
          readOnly
        />
      </div>
      <button
        type="submit"
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 self-start"
      >
        Save
      </button>
    </form>
  );
};

export default EditableProfileCard;
