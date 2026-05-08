import { useQuery } from "@tanstack/react-query";
import { useApi } from "@providers";
import { queryKeys } from "../queryKeys";

const useGetDbStatus = ({ enabled = true } = {}) => {
  const { apiManager } = useApi();
  return useQuery({
    queryKey: queryKeys.adminDbStatus(),
    queryFn: () => apiManager.admin.getDbStatus(),
    enabled,
  });
};

export { useGetDbStatus };
