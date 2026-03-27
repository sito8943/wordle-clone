const LETTER_KEY_PATTERN = /[a-z]/i;
const NON_ALPHA_PATTERN = /[^A-Z]/g;

export const toWordleKeyFromNativeKeyboardEvent = (
  eventKey: string,
): string | null => {
  if (eventKey === "Enter") {
    return "ENTER";
  }

  if (eventKey === "Backspace") {
    return "BACKSPACE";
  }

  if (eventKey.length === 1 && LETTER_KEY_PATTERN.test(eventKey)) {
    return eventKey.toUpperCase();
  }

  return null;
};

export const extractNativeKeyboardLetters = (value: string): string[] => {
  const letters = value.toUpperCase().replace(NON_ALPHA_PATTERN, "");
  return letters.length > 0 ? letters.split("") : [];
};
