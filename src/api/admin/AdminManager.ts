import type { HttpGateway } from "@api/http";

type DbStatus = {
  empty: boolean;
  counts: Record<string, number>;
};

type ImportBackupInput = {
  payload: unknown;
};

type ImportBackupResult = {
  ok: true;
  imported: Record<string, number>;
};

class AdminManager {
  private static readonly BASE_PATH = "/api/v2/admin";

  private readonly gateway: HttpGateway;

  constructor(gateway: HttpGateway) {
    this.gateway = gateway;
  }

  getDbStatus(): Promise<DbStatus> {
    return this.gateway.get<DbStatus>(`${AdminManager.BASE_PATH}/db/status`);
  }

  importBackup(input: ImportBackupInput): Promise<ImportBackupResult> {
    return this.gateway.post<ImportBackupResult>(
      `${AdminManager.BASE_PATH}/db/imports`,
      input as Record<string, unknown>,
    );
  }
}

export { AdminManager };
export type { DbStatus, ImportBackupInput, ImportBackupResult };
