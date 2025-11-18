export type ApiClientOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  retry?: {
    attempts?: number;
    backoffMs?: number;
  };
};

export type NormalizedError = {
  status: number;
  message: string;
  details?: unknown;
};

const DEFAULT_RETRY = { attempts: 3, backoffMs: 250 };

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || "http://localhost:3000";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeError(status: number, payload: any): NormalizedError {
  const message =
    typeof payload === "string"
      ? payload
      : payload?.message || payload?.error || "Request failed. Please try again.";
  return { status, message, details: payload?.details ?? payload };
}

function hasHeader(headers: Record<string, string>, name: string) {
  return Object.keys(headers).some((key) => key.toLowerCase() === name.toLowerCase());
}

export async function apiClient<T>(path: string, options: ApiClientOptions = {}): Promise<T> {
  const { method = "GET", headers = {}, body, retry = DEFAULT_RETRY } = options;
  const attempts = retry.attempts ?? DEFAULT_RETRY.attempts;
  const backoffMs = retry.backoffMs ?? DEFAULT_RETRY.backoffMs;

  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...headers,
  };

  if (!(body instanceof FormData) && !hasHeader(headers, "Content-Type")) {
    finalHeaders["Content-Type"] = "application/json";
  }

  if (API_KEY && !hasHeader(headers, "Authorization")) {
    finalHeaders.Authorization = `Bearer ${API_KEY}`;
  }

  let lastError: NormalizedError | null = null;

  for (let attempt = 1; attempt <= (attempts ?? 1); attempt++) {
    try {
      const response = await fetch(url, {
        method,
        headers: finalHeaders,
        body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const payload = await safeParseJson(response);
        throw normalizeError(response.status, payload);
      }

      const text = await response.text();
      const parsed = text ? safeJson(text) : undefined;
      return parsed as T;
    } catch (error: any) {
      lastError = error;
      if (attempt >= (attempts ?? 1)) break;
      await sleep(backoffMs * attempt);
    }
  }

  throw lastError ?? { status: 500, message: "Unknown error" };
}

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function safeParseJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return await response.text();
  }
}
