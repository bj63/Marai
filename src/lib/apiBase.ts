export function resolveApiBase(defaultBase = "") {
  const runtimeConfig = readRuntimeConfig();

  const bases = [
    runtimeConfig?.apiBaseUrl,
    process.env.NEXT_PUBLIC_API_BASE_URL,
    process.env.NEXT_PUBLIC_API_BASE,
    process.env.NEXT_PUBLIC_API_URL,
    process.env.NEXT_PUBLIC_MOA_API_URL,
    process.env.API_BASE_URL,
    process.env.API_BASE,
    defaultBase,
    typeof window !== "undefined" ? window.location?.origin ?? "" : "",
    "",
  ].filter((value): value is string => typeof value === "string");

  for (const candidate of bases) {
    if (candidate && candidate.trim().length > 0) {
      return candidate.replace(/\/$/, "");
    }
  }

  return "";
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
