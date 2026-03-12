import { useState, useEffect } from "react";
import Button from "../Button/Button";
import type { EditableProfileCardPropsTypes } from "./types";

const EditableProfileCard = (props: EditableProfileCardPropsTypes) => {
  const [name, setName] = useState(props.name);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length === 0) {
      setError("Name cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    const submitError = await props.onSubmit(name);
    if (submitError) {
      setError(submitError);
      setIsSubmitting(false);
      return;
    }

    setError("");
    setIsSubmitting(false);
  };

  useEffect(() => {
    setName(props.name);
    setError("");
  }, [props.name, props.score]);

  return (
    <form onSubmit={handleSubmit} className="profile-card-container">
      <div className="profile-card-field-row">
        <label htmlFor="name">Name:</label>
        <input
          className="profile-card-field-input"
          id="name"
          type="text"
          value={name}
          maxLength={30}
          autoFocus
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      {error && <p className="input-error-text">{error}</p>}
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
      <Button type="submit" className="self-start" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save"}
      </Button>
    </form>
  );
};

export default EditableProfileCard;
