import { useQuery } from "@tanstack/react-query";
import type { GetMeParams } from "@api/players";
import { useApi } from "@providers";
import { queryKeys } from "../queryKeys";

type UseGetMeOptions = GetMeParams & { enabled?: boolean };

const useGetMe = ({ language, enabled = true }: UseGetMeOptions = {}) => {
  const { apiManager } = useApi();
  return useQuery({
    queryKey: queryKeys.playerMe(language),
    queryFn: () => apiManager.players.getMe({ language }),
    enabled,
  });
};

export { useGetMe };
export type { UseGetMeOptions };
