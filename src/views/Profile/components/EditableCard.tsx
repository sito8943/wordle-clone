import { useState, useEffect } from "react";
import Button from "@components/Button/Button";
import { useTranslation } from "@i18n";
import type { EditableProfileCardPropsTypes } from "./types";

const EditableProfileCard = (props: EditableProfileCardPropsTypes) => {
  const { t } = useTranslation();
  const [name, setName] = useState(props.name);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length === 0) {
      setError(t("profile.emptyNameError"));
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
    <form
      onSubmit={handleSubmit}
      className="profile-section profile-card-container"
    >
      <div className="profile-card-field-row">
        <label htmlFor="name" className="profile-field-label">
          {t("profile.labels.name")}
        </label>
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
      <Button type="submit" className="self-start" disabled={isSubmitting}>
        {isSubmitting
          ? t("profile.savingAction")
          : t("profile.saveAction")}
      </Button>
    </form>
  );
};

export default EditableProfileCard;
