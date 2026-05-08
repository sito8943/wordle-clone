import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ImportBackupInput } from "@api/admin";
import { useApi } from "@providers";
import { queryKeys } from "../queryKeys";

const useImportBackup = () => {
  const { apiManager } = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ImportBackupInput) =>
      apiManager.admin.importBackup(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin });
    },
  });
};

export { useImportBackup };
