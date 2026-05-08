import { ApiNetworkError, buildApiError } from "./errors";

type QueryValue = string | number | boolean | undefined | null;
type QueryParams = Record<string, QueryValue>;
type JsonBody = Record<string, unknown> | undefined;
type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

type HttpGatewayOptions = {
  baseUrl?: string;
};

class HttpGateway {
  private readonly baseUrl: string | null;

  constructor(options: HttpGatewayOptions = {}) {
    this.baseUrl = this.normalizeBaseUrl(options.baseUrl);
  }

  get isConfigured(): boolean {
    return this.baseUrl !== null;
  }

  get<T>(path: string, query?: QueryParams): Promise<T> {
    return this.request<T>("GET", path, { query });
  }

  post<T>(path: string, body?: JsonBody): Promise<T> {
    return this.request<T>("POST", path, { body });
  }

  patch<T>(path: string, body?: JsonBody): Promise<T> {
    return this.request<T>("PATCH", path, { body });
  }

  put<T>(path: string, body?: JsonBody): Promise<T> {
    return this.request<T>("PUT", path, { body });
  }

  delete<T>(path: string, body?: JsonBody): Promise<T> {
    return this.request<T>("DELETE", path, { body });
  }

  private async request<T>(
    method: HttpMethod,
    path: string,
    options: { query?: QueryParams; body?: JsonBody },
  ): Promise<T> {
    const url = this.buildUrl(path, options.query);
    const init: RequestInit = {
      method,
      headers: { "Content-Type": "application/json" },
    };

    if (options.body !== undefined) {
      init.body = JSON.stringify(options.body);
    }

    let response: Response;
    try {
      response = await fetch(url, init);
    } catch (cause) {
      throw new ApiNetworkError("Network request failed.", cause);
    }

    const payload = await this.parseBody(response);

    if (!response.ok) {
      const message = this.resolveErrorMessage(payload, response.statusText);
      throw buildApiError(response.status, message, payload);
    }

    return payload as T;
  }

  private buildUrl(path: string, query?: QueryParams): string {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const base = this.requireBaseUrl();
    const queryString = this.buildQueryString(query);
    return `${base}${normalizedPath}${queryString}`;
  }

  private buildQueryString(query?: QueryParams): string {
    if (!query) return "";

    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      params.append(key, String(value));
    }

    const serialized = params.toString();
    return serialized.length > 0 ? `?${serialized}` : "";
  }

  private async parseBody(response: Response): Promise<unknown> {
    const text = await response.text();
    if (!text) return null;
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
      const candidate =
        (payload as { error?: unknown }).error ??
        (payload as { message?: unknown }).message;
      if (typeof candidate === "string" && candidate.trim().length > 0) {
        return candidate;
      }
    }

    return fallback || "Request failed.";
  }

  private normalizeBaseUrl(value?: string): string | null {
    if (!value) return null;
    const trimmed = value.trim();
    if (trimmed.length === 0) return null;
    return trimmed.replace(/\/+$/, "");
  }

  private requireBaseUrl(): string {
    if (this.baseUrl === null) {
      throw new Error("Backend is not configured. Missing VITE_BACKEND_URL.");
    }
    return this.baseUrl;
  }
}

export { HttpGateway };
export type { HttpGatewayOptions, QueryParams, JsonBody };
