const DEFAULT_REMOTE_API_BASE = "https://moaaiv3-production.up.railway.app";

export function resolveApiBase(defaultBase = DEFAULT_REMOTE_API_BASE) {
  // If we are on the server (SSR), use the direct remote URL to avoid local proxy issues
  if (typeof window === 'undefined') {
    return (
      process.env.NEXT_PUBLIC_MOA_API_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE ||
      defaultBase
    );
  }

  // If we are on the client, use the local proxy to avoid CORS
  return "/api/backend";
}

// Helper types and globals (kept for compatibility if needed, though unused in simplified logic above)
type MaraiRuntimeConfig = {
  apiBaseUrl?: string;
};

declare global {
  interface Window {
    __MARAI_CONFIG?: MaraiRuntimeConfig;
  }
}
