export { ConsentProvider } from "./ConsentProvider";
export { useConsent } from "./useConsent";
export { CONSENT_STORAGE_KEY, CONSENT_VERSION } from "./constants";
export { persistConsent, readStoredConsent } from "./utils";
export type {
  ConsentContextType,
  ConsentProviderProps,
  StoredConsent,
} from "./types";
