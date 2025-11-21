const DEFAULT_REMOTE_API_BASE = "https://moaaiv3-production.up.railway.app";

export function resolveApiBase(defaultBase?: string) {
  const runtimeConfig = readRuntimeConfig();
  const fallbackBase = resolveFallbackBase(defaultBase);

  const bases = [
    runtimeConfig?.apiBaseUrl,
    process.env.NEXT_PUBLIC_API_BASE_URL,
    process.env.NEXT_PUBLIC_API_BASE,
    process.env.NEXT_PUBLIC_API_URL,
    process.env.NEXT_PUBLIC_MOA_API_URL,
    process.env.API_BASE_URL,
    process.env.API_BASE,
    fallbackBase,
    typeof window !== "undefined" ? window.location?.origin ?? "" : "",
    "",
  ].filter((value): value is string => typeof value === "string");

  for (const candidate of bases) {
    const normalized = normalizeBase(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function resolveFallbackBase(defaultBase?: string) {
  if (defaultBase && defaultBase.trim()) {
    return defaultBase;
  }

  return DEFAULT_REMOTE_API_BASE;
}

function normalizeBase(candidate?: string) {
  if (!candidate || typeof candidate !== "string") return "";

  const trimmed = candidate.trim();
  if (!trimmed) return "";

  const withoutTrailingSlash = trimmed.replace(/\/$/, "");

  if (withoutTrailingSlash.startsWith("/")) return withoutTrailingSlash;
  if (/^https?:\/\//i.test(withoutTrailingSlash)) return withoutTrailingSlash;

  return `https://${withoutTrailingSlash}`;
}

type MaraiRuntimeConfig = {
  apiBaseUrl?: string;
};

declare global {
  interface Window {
    __MARAI_CONFIG?: MaraiRuntimeConfig;
  }
}

function readRuntimeConfig(): MaraiRuntimeConfig | undefined {
  if (typeof window === "undefined") return undefined;

  if (window.__MARAI_CONFIG && typeof window.__MARAI_CONFIG === "object") {
    return window.__MARAI_CONFIG;
  }

  const script = document.getElementById("marai-config");
  if (!script?.textContent) return undefined;

  try {
    return JSON.parse(script.textContent);
  } catch (error) {
    console.warn("Failed to parse marai-config JSON", error);
    return undefined;
  }
}
