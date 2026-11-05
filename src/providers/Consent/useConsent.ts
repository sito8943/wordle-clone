import { useContext } from "react";
import { DEFAULT_CONSENT_CONTEXT } from "./constants";
import { ConsentContext } from "./ConsentContext";

const useConsent = () => useContext(ConsentContext) ?? DEFAULT_CONSENT_CONTEXT;

export { useConsent };
