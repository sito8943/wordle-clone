import { useState, useEffect } from "react";
import Button from "../Button";
import type { EditableProfileCardPropsTypes } from "./types";

const EditableProfileCard = (props: EditableProfileCardPropsTypes) => {
  const [name, setName] = useState(props.name);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length === 0) {
      setError("Name cannot be empty.");
      return;
    }

    props.onSubmit(name);
    setError("");
  };

  useEffect(() => {
    setName(props.name);
    setError("");
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
          maxLength={30}
          autoFocus
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
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
      <Button type="submit" className="self-start">
        Save
      </Button>
    </form>
  );
};

export default EditableProfileCard;
