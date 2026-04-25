import { ConvexHttpClient } from "convex/browser";
import type { FunctionReference } from "convex/server";

type ConvexGatewayOptions = {
  backendUrl?: string;
  convexUrl?: string;
};

class ConvexGateway {
  private readonly client: ConvexHttpClient | null;
  private readonly backendBaseUrl: string | null;

  constructor(options?: string | ConvexGatewayOptions) {
    const normalizedOptions =
      typeof options === "string" ? { convexUrl: options } : (options ?? {});

    this.backendBaseUrl = this.normalizeBaseUrl(normalizedOptions.backendUrl);
    this.client =
      this.backendBaseUrl === null && normalizedOptions.convexUrl
        ? new ConvexHttpClient(normalizedOptions.convexUrl)
        : null;
  }

  get isConfigured(): boolean {
    return this.backendBaseUrl !== null || this.client !== null;
  }

  async query<TResult>(
    reference: string,
    args: Record<string, unknown> = {},
  ): Promise<TResult> {
    if (this.backendBaseUrl !== null) {
      return this.request<TResult>("query", reference, args);
    }

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
    if (this.backendBaseUrl !== null) {
      return this.request<TResult>("mutation", reference, args);
    }

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
      "econnrefused",
    ].some((text) => lowered.includes(text));
  }

  private async request<TResult>(
    kind: "query" | "mutation",
    name: string,
    args: Record<string, unknown>,
  ): Promise<TResult> {
    const baseUrl = this.requireBackendBaseUrl();
    const response = await fetch(`${baseUrl}/api/${kind}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, args }),
    });
    const payload = await this.parseResponseBody(response);

    if (!response.ok) {
      throw new Error(this.resolveErrorMessage(payload, response.statusText));
    }

    if (
      payload &&
      typeof payload === "object" &&
      "ok" in payload &&
      (payload as { ok?: unknown }).ok === false
    ) {
      throw new Error(this.resolveErrorMessage(payload, response.statusText));
    }

    if (
      payload &&
      typeof payload === "object" &&
      "ok" in payload &&
      (payload as { ok?: unknown }).ok === true
    ) {
      if ("result" in payload) {
        return (payload as { result: TResult }).result;
      }

      if ("data" in payload) {
        return (payload as { data: TResult }).data;
      }
    }

    return payload as TResult;
  }

  private async parseResponseBody(response: Response): Promise<unknown> {
    const text = await response.text();
    if (!text) {
      return null;
    }

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  private resolveErrorMessage(payload: unknown, fallback: string): string {
    if (typeof payload === "string" && payload.trim().length > 0) {
      return payload;
    }

    if (payload && typeof payload === "object") {
      const error = (payload as { error?: unknown }).error;
      if (typeof error === "string" && error.trim().length > 0) {
        return error;
      }

      const message = (payload as { message?: unknown }).message;
      if (typeof message === "string" && message.trim().length > 0) {
        return message;
      }
    }

    return fallback || "Request failed.";
  }

  private normalizeBaseUrl(value?: string): string | null {
    if (!value) {
      return null;
    }

    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return null;
    }

    return trimmed.replace(/\/+$/, "");
  }

  private requireBackendBaseUrl(): string {
    if (this.backendBaseUrl === null) {
      throw new Error(
        "Backend is not configured. Missing VITE_BACKEND_URL or VITE_CONVEX_URL.",
      );
    }

    return this.backendBaseUrl;
  }

  private requireClient(): ConvexHttpClient {
    if (!this.client) {
      throw new Error(
        "Backend is not configured. Missing VITE_BACKEND_URL or VITE_CONVEX_URL.",
      );
    }

    return this.client;
  }
}

export { ConvexGateway };
