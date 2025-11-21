export function resolveApiBase(defaultBase = "") {
  const bases = [
    process.env.NEXT_PUBLIC_API_BASE_URL,
    process.env.NEXT_PUBLIC_API_BASE,
    process.env.NEXT_PUBLIC_API_URL,
    process.env.NEXT_PUBLIC_MOA_API_URL,
    process.env.API_BASE_URL,
    process.env.API_BASE,
    "",
  ].filter((value): value is string => typeof value === "string");

  for (const candidate of bases) {
    if (candidate && candidate.trim().length > 0) {
      return candidate.replace(/\/$/, "");
    }
  }

  return defaultBase.replace(/\/$/, "");
}
