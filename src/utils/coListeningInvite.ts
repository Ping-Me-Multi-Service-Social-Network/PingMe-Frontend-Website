export type CoListeningInviteInfo = {
  href: string;
  joinPath: string;
  hostUserId: string | null;
  token: string | null;
};

export function parseCoListeningInvite(text: string | null | undefined): CoListeningInviteInfo | null {
  if (typeof text !== "string") return null;

  const trimmed = text.trim();
  if (!trimmed) return null;

  // Only transform when the message is essentially a single URL (avoid surprising rewrites).
  const tokens = trimmed.split(/\s+/);
  if (tokens.length !== 1) return null;

  const rawUrl = tokens[0];
  if (!/^https?:\/\//i.test(rawUrl)) return null;

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  if (!url.pathname.startsWith("/app/music")) return null;

  const hostUserId = url.searchParams.get("join-session");
  const token = url.searchParams.get("token");
  if (!hostUserId || !token) return null;

  return {
    href: url.toString(),
    joinPath: `${url.pathname}${url.search}${url.hash}`,
    hostUserId,
    token,
  };
}
