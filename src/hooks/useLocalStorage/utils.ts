export function getInitialValue<T>(initialValue: T | (() => T)): T {
  if (typeof initialValue === "function") {
    return (initialValue as () => T)();
  }
  return initialValue;
}
