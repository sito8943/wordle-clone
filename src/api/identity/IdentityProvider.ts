const CLIENT_ID_KEY = "wordle:scoreboard:client-id";
const PROFILE_IDENTITY_KEY = "wordle:scoreboard:profile-identity";

type Identity = {
  clientId: string;
  clientRecordId?: string;
};

const createId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `cid_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

class IdentityProvider {
  private readonly storage: Storage;
  private cachedClientId: string | null = null;

  constructor(storage?: Storage) {
    this.storage = storage ?? IdentityProvider.resolveStorage();
  }

  getClientId(): string {
    if (this.cachedClientId) return this.cachedClientId;

    const existing = this.read(CLIENT_ID_KEY);
    if (existing) {
      this.cachedClientId = existing;
      return existing;
    }

    const created = createId();
    this.write(CLIENT_ID_KEY, created);
    this.cachedClientId = created;
    return created;
  }

  getClientRecordId(): string | null {
    const raw = this.read(PROFILE_IDENTITY_KEY);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as { clientRecordId?: unknown };
      const value = parsed.clientRecordId;
      return typeof value === "string" && value.length > 0 ? value : null;
    } catch {
      return null;
    }
  }

  setClientRecordId(clientRecordId: string): void {
    this.write(PROFILE_IDENTITY_KEY, JSON.stringify({ clientRecordId }));
  }

  clearClientRecordId(): void {
    this.remove(PROFILE_IDENTITY_KEY);
  }

  getIdentity(): Identity {
    const clientId = this.getClientId();
    const clientRecordId = this.getClientRecordId();
    return clientRecordId ? { clientId, clientRecordId } : { clientId };
  }

  requireIdentity(): Required<Identity> {
    const clientId = this.getClientId();
    const clientRecordId = this.getClientRecordId();
    if (!clientRecordId) {
      throw new Error("Player profile not registered.");
    }
    return { clientId, clientRecordId };
  }

  private read(key: string): string | null {
    try {
      return this.storage.getItem(key);
    } catch {
      return null;
    }
  }

  private write(key: string, value: string): void {
    try {
      this.storage.setItem(key, value);
    } catch {
      /* swallow — storage may be unavailable */
    }
  }

  private remove(key: string): void {
    try {
      this.storage.removeItem(key);
    } catch {
      /* swallow */
    }
  }

  private static resolveStorage(): Storage {
    if (typeof window !== "undefined") return window.localStorage;
    const memory = new Map<string, string>();
    return {
      get length() {
        return memory.size;
      },
      clear: () => memory.clear(),
      getItem: (key: string) => memory.get(key) ?? null,
      key: (i: number) => [...memory.keys()][i] ?? null,
      removeItem: (key: string) => {
        memory.delete(key);
      },
      setItem: (key: string, value: string) => {
        memory.set(key, value);
      },
    } as Storage;
  }
}

export { IdentityProvider };
export type { Identity };
