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
    <section className="flex w-full max-w-xl flex-col gap-3 rounded-lg border border-neutral-300 bg-white/60 p-4 dark:border-neutral-700 dark:bg-neutral-800/40">
      <h2 className="text-lg font-semibold">{PROFILE_RECOVERY_SECTION_TITLE}</h2>
      <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleSubmit}>
        <div className="flex-1">
          <label
            htmlFor={PROFILE_RECOVERY_INPUT_ID}
            className="block text-sm font-semibold"
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
            className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm uppercase tracking-[0.3em] text-neutral-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
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
