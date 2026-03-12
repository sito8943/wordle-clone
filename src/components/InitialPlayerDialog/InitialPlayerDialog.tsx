import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Button } from "../Button";
import {
  INITIAL_PLAYER_DIALOG_DESCRIPTION,
  INITIAL_PLAYER_DIALOG_EMPTY_NAME_ERROR,
  INITIAL_PLAYER_DIALOG_INPUT_ID,
  INITIAL_PLAYER_DIALOG_PRIMARY_ACTION_LABEL,
  INITIAL_PLAYER_DIALOG_TITLE,
  INITIAL_PLAYER_DIALOG_TITLE_ID,
} from "./constant";
import type { InitialPlayerDialogProps } from "./types";

const InitialPlayerDialog = ({
  initialName,
  onConfirm,
}: InitialPlayerDialogProps) => {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (name.trim().length === 0) {
      setError(INITIAL_PLAYER_DIALOG_EMPTY_NAME_ERROR);
      return;
    }

    setError("");
    onConfirm(name);
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/45 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={INITIAL_PLAYER_DIALOG_TITLE_ID}
        className="w-full max-w-md rounded-2xl border border-neutral-300 bg-white p-6 shadow-2xl"
      >
        <h2
          id={INITIAL_PLAYER_DIALOG_TITLE_ID}
          className="text-xl font-bold text-neutral-900"
        >
          {INITIAL_PLAYER_DIALOG_TITLE}
        </h2>
        <p className="mt-2 text-sm text-neutral-700">
          {INITIAL_PLAYER_DIALOG_DESCRIPTION}
        </p>

        <form className="mt-4" onSubmit={handleSubmit}>
          <label
            htmlFor={INITIAL_PLAYER_DIALOG_INPUT_ID}
            className="block text-sm font-semibold text-neutral-900"
          >
            Player name
          </label>
          <input
            ref={nameInputRef}
            id={INITIAL_PLAYER_DIALOG_INPUT_ID}
            type="text"
            value={name}
            maxLength={30}
            onChange={(event: ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
              setName(event.target.value);
              event.stopPropagation();
            }}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
          />

          {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}

          <div className="mt-5 flex justify-end">
            <Button type="submit">
              {INITIAL_PLAYER_DIALOG_PRIMARY_ACTION_LABEL}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InitialPlayerDialog;
