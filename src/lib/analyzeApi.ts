import { resolveApiBase } from "./apiBase";

export type AnalyzeRequest = {
  message: string;
  userId: string;
  user_id?: string;
  personality?: string;
  federationId?: string;
  wallet?: string;
  relationshipContext?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

export type AnalyzeResponse = {
  emotion?: string;
  scores?: Record<string, number>;
  color?: string;
  personality?: string;
  summary?: string;
  reasoning?: string;
  insights?: Array<{
    id?: string;
    title: string;
    detail?: string;
    sentiment?: string;
  }>;
  attachments?: Array<{
    id?: string;
    url: string;
    title?: string;
    type?: string;
    mimeType?: string;
  }>;
  audioCue?: {
    transcript?: string;
    url?: string;
    voice?: string;
  };
  mediaDreams?: Array<{
    id?: string;
    posterUrl?: string;
    prompt?: string;
    description?: string;
  }>;
  timeline?: Array<{
    id?: string;
    title: string;
    ts?: string;
    intent?: string;
    confidence?: number;
  }>;
  attachmentsBaseUrl?: string;
  [key: string]: unknown;
};

const ANALYZE_PATH = "/api/analyze";

type AnalyzeOptions = {
  authToken?: string;
};

function buildAnalyzeBody(payload: AnalyzeRequest): Record<string, unknown> {
  const userId = payload.userId || payload.user_id;
  const body: Record<string, unknown> = {
    message: payload.message,
    user_id: userId,
    userId
  };

  if (payload.personality) body.personality = payload.personality;
  if (payload.federationId) body.federationId = payload.federationId;
  if (payload.wallet) body.wallet = payload.wallet;
  if (payload.relationshipContext)
    body.relationshipContext = payload.relationshipContext;
  if (payload.metadata) body.metadata = payload.metadata;

  return body;
}

export async function analyzeMessage(
  payload: AnalyzeRequest,
  options: AnalyzeOptions = {}
) {
  const base = resolveApiBase();
  const endpoint = `${base}${ANALYZE_PATH}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  if (options.authToken) {
    headers.Authorization = `Bearer ${options.authToken}`;
  }
  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(buildAnalyzeBody(payload))
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(`Analyze request failed: ${res.status} ${message}`);
  }

  return (await res.json()) as AnalyzeResponse;
}

export async function requestDevToken(userId: string) {
  const base = resolveApiBase();
  const endpoint = `${base}/api/dev-login`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId })
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(`Dev login failed: ${res.status} ${message}`);
  }

  return (await res.json()) as { token: string; userId: string; expiresAt?: string };
}
