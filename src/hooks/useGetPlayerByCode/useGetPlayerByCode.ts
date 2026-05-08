import { useQuery } from "@tanstack/react-query";
import { useApi } from "@providers";
import { queryKeys } from "../queryKeys";

type UseGetPlayerByCodeParams = {
  code: string;
  enabled?: boolean;
};

const useGetPlayerByCode = ({
  code,
  enabled = true,
}: UseGetPlayerByCodeParams) => {
  const { apiManager } = useApi();
  return useQuery({
    queryKey: queryKeys.playerByCode(code),
    queryFn: () => apiManager.players.getByCode(code),
    enabled: enabled && code.length > 0,
  });
};

export { useGetPlayerByCode };
export type { UseGetPlayerByCodeParams };
