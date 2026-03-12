import { useState, useEffect } from "react";

function getInitialValue<T>(initialValue: T | (() => T)): T {
  if (typeof initialValue === "function") {
    return (initialValue as () => T)();
  }
  return initialValue;
}

function useLocalStorage<T>(key: string, initialValue: T | (() => T)) {
  const [value, setValue] = useState<T>(() => {
    const fallback = getInitialValue(initialValue);
    const saved = localStorage.getItem(key);
    if (!saved) {
      return fallback;
    }

    try {
      return JSON.parse(saved) as T;
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage errors (private mode/quota exceeded) and keep in-memory state.
    }
  }, [key, value]);

  return [value, setValue] as const;
}

export default useLocalStorage;
