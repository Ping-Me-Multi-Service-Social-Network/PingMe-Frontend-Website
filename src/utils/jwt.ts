export function safeAtobBase64Url(input: string): string {
  // JWT uses base64url (no padding, '-' and '_' instead of '+' and '/')
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "===".slice((normalized.length + 3) % 4);

  // `atob` is available in the browser. Guard for safety in unexpected runtimes.
  if (typeof atob !== "function") throw new Error("atob is not available");
  return atob(padded);
}

export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const json = safeAtobBase64Url(parts[1]);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

