import type { ApiClientOptions } from "./apiClient";
import { apiClient } from "./apiClient";

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

function buildHeaders(options: AnalyzeOptions): ApiClientOptions["headers"] {
  if (!options.authToken) return undefined;
  return { Authorization: `Bearer ${options.authToken}` };
}

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
  return apiClient<AnalyzeResponse>(ANALYZE_PATH, {
    method: "POST",
    headers: buildHeaders(options),
    body: buildAnalyzeBody(payload)
  });
}

export async function requestDevToken(userId: string) {
  return apiClient<{ token: string; userId: string; expiresAt?: string }>("/api/dev-login", {
    method: "POST",
    body: { userId }
  });
}
