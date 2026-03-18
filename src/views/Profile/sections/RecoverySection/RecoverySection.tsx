import { useState } from "react";
import { Button } from "@components";
import {
  PROFILE_RECOVERY_ACTION_LABEL,
  PROFILE_RECOVERY_INPUT_ID,
  PROFILE_RECOVERY_INPUT_LABEL,
  PROFILE_RECOVERY_SECTION_TITLE,
} from "@views/Profile/constants";
import { useProfileView } from "@views/Profile/providers";

const RecoverySection = () => {
  const {
    controller: { submitRecoveryCode },
  } = useProfileView();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const submitError = await submitRecoveryCode(code);
    setIsSubmitting(false);

    if (submitError) {
      setError(submitError);
      return;
    }

    setCode("");
    setError("");
  };

  return (
    <section className="profile-section">
      <h2 className="profile-section-title">
        {PROFILE_RECOVERY_SECTION_TITLE}
      </h2>
      <form
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
        onSubmit={handleSubmit}
      >
        <div className="flex-1">
          <label
            htmlFor={PROFILE_RECOVERY_INPUT_ID}
            className="profile-field-label"
          >
            {PROFILE_RECOVERY_INPUT_LABEL}
          </label>
          <input
            id={PROFILE_RECOVERY_INPUT_ID}
            type="text"
            value={code}
            maxLength={4}
            autoCapitalize="characters"
            onChange={(event) => {
              setCode(event.target.value.toUpperCase());
              if (error) {
                setError("");
              }
            }}
            className="profile-card-field-input mt-1 uppercase tracking-[0.3em]"
          />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {PROFILE_RECOVERY_ACTION_LABEL}
        </Button>
      </form>
      {error ? <p className="input-error-text">{error}</p> : null}
    </section>
  );
};

export default RecoverySection;
