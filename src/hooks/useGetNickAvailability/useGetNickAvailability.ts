import { useQuery } from "@tanstack/react-query";
import { useApi } from "@providers";
import { queryKeys } from "../queryKeys";

type UseGetNickAvailabilityParams = {
  nick: string;
  enabled?: boolean;
};

const useGetNickAvailability = ({
  nick,
  enabled = true,
}: UseGetNickAvailabilityParams) => {
  const { apiManager } = useApi();
  return useQuery({
    queryKey: queryKeys.playerNickAvailability(nick),
    queryFn: () => apiManager.players.getNickAvailability(nick),
    enabled: enabled && nick.length > 0,
  });
};

export { useGetNickAvailability };
export type { UseGetNickAvailabilityParams };
