import { useContext } from "react";
import { ApiContext } from "./ApiContext";

const useApi = () => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error("useApi must be used within an ApiProvider");
  }

  return context;
};

export { useApi };
