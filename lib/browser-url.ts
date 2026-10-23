/**
 * The address-bar text a browser frame shows for a captured page, e.g.
 * "https://www.github.com/AniketR10/" -> "github.com/AniketR10". Matches how
 * Chrome and Safari trim the scheme, "www.", and a trailing slash.
 */
export function browserDisplayUrl(url: string): string {
  const trimmed = url.trim();
  try {
    const parsed = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    const host = parsed.host.replace(/^www\./i, "");
    const rest = `${parsed.pathname}${parsed.search}${parsed.hash}`.replace(/\/$/, "");
    return `${host}${rest}`;
  } catch {
    return trimmed.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  }
}
