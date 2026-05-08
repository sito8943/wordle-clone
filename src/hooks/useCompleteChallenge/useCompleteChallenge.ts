import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@providers";
import { queryKeys } from "../queryKeys";

type CompleteChallengeArgs = {
  challengeId: string;
  date: string;
};

const useCompleteChallenge = () => {
  const { apiManager } = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ challengeId, date }: CompleteChallengeArgs) =>
      apiManager.challenges.complete(challengeId, date),
    onSuccess: (_data, { date }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.challengesProgress(date),
      });
    },
  });
};

export { useCompleteChallenge };
export type { CompleteChallengeArgs };
