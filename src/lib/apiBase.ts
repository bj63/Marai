const DEFAULT_REMOTE_API_BASE = "https://moaaiv3-production.up.railway.app";

type MaraiRuntimeConfig = {
  apiBaseUrl?: string;
  API_BASE_URL?: string;
  baseUrl?: string;
};

declare global {
  interface Window {
    __MARAI_CONFIG?: MaraiRuntimeConfig;
  }
}

export function readRuntimeConfig(): MaraiRuntimeConfig | null {
  if (typeof window === "undefined") return null;

  const fromWindow = window.__MARAI_CONFIG || null;
  const inlineConfig = (() => {
    const script = document.getElementById("marai-config");
    if (!script?.textContent) return null;
    try {
      return JSON.parse(script.textContent) as MaraiRuntimeConfig;
    } catch (error) {
      console.warn("Failed to parse marai-config script", error);
      return null;
    }
  })();

  const merged = { ...(inlineConfig || {}), ...(fromWindow || {}) } as MaraiRuntimeConfig;
  return Object.keys(merged).length ? merged : null;
}

export function resolveApiBase(defaultBase = DEFAULT_REMOTE_API_BASE) {
  const runtime = readRuntimeConfig();
  const runtimeBase = runtime?.apiBaseUrl || runtime?.API_BASE_URL || runtime?.baseUrl;

  const envBase =
    process.env.NEXT_PUBLIC_MOA_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE;

  const resolved = runtimeBase || envBase || defaultBase;
  return resolved?.replace(/\/$/, "");
}
