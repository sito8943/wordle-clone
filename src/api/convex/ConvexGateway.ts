import { ConvexHttpClient } from "convex/browser";
import type { FunctionReference } from "convex/server";

class ConvexGateway {
  private readonly client: ConvexHttpClient | null;

  constructor(url?: string) {
    this.client = url ? new ConvexHttpClient(url) : null;
  }

  get isConfigured(): boolean {
    return this.client !== null;
  }

  async query<TResult>(
    reference: string,
    args: Record<string, unknown> = {},
  ): Promise<TResult> {
    const client = this.requireClient();
    return client.query(
      reference as unknown as FunctionReference<"query">,
      args as Record<string, never>,
    );
  }

  async mutation<TResult>(
    reference: string,
    args: Record<string, unknown> = {},
  ): Promise<TResult> {
    const client = this.requireClient();
    return client.mutation(
      reference as unknown as FunctionReference<"mutation">,
      args as Record<string, never>,
    );
  }

  isNetworkError(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false;
    }

    const lowered = error.message.toLowerCase();
    return [
      "failed to fetch",
      "network",
      "offline",
      "connection",
      "timeout",
    ].some((text) => lowered.includes(text));
  }

  private requireClient(): ConvexHttpClient {
    if (!this.client) {
      throw new Error("Convex is not configured. Missing VITE_CONVEX_URL.");
    }

    return this.client;
  }
}

export { ConvexGateway };
