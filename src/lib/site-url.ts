function stripTrailingSlash(u: string): string {
  return u.replace(/\/+$/, "");
}

function isLocalHostname(host: string): boolean {
  const h = host.toLowerCase();
  return h === "localhost" || h === "127.0.0.1" || h === "::1" || h === "0.0.0.0";
}

function browserOriginIfNotLocal(): string | null {
  if (typeof window === "undefined") return null;
  const o = stripTrailingSlash(window.location.origin);
  try {
    if (!isLocalHostname(new URL(o).hostname)) return o;
  } catch {
    return null;
  }
  return null;
}

/**
 * Public origin for auth redirects (magic links), hero CTAs, and rewriting stored localhost URLs.
 *
 * Resolution order:
 * 1. `VITE_SITE_URL` — set this in Vercel + locally for a stable production domain (custom domain preferred).
 * 2. Current `window.location.origin` if not localhost (works on deployed preview/production).
 * 3. `VITE_SITE_URL_FALLBACK` — use while running on localhost so emails/links still target production.
 * 4. Build-time `VITE_SITE_URL` or `https://${VERCEL_URL}` baked into the bundle (Vercel builds).
 * 5. `window.location.origin` (localhost last resort).
 */
export function getPublicSiteUrl(): string {
  const configured = import.meta.env.VITE_SITE_URL?.trim();
  if (configured) return stripTrailingSlash(configured);

  const fromBrowser = browserOriginIfNotLocal();
  if (fromBrowser) return fromBrowser;

  const envFallback = import.meta.env.VITE_SITE_URL_FALLBACK?.trim();
  if (envFallback) return stripTrailingSlash(envFallback);

  const baked = typeof __SWNCK_BUILD_ORIGIN__ !== "undefined" ? __SWNCK_BUILD_ORIGIN__.trim() : "";
  if (baked) return stripTrailingSlash(baked);

  if (typeof window !== "undefined") return stripTrailingSlash(window.location.origin);

  return "";
}

/**
 * If a stored absolute URL points at localhost (common after admin sessions on dev), swap in the public site origin
 * so images and links work when the laptop / dev server is off. Relative URLs and non-local hosts are unchanged.
 */
export function resolvePublicAssetUrl(url: string | null | undefined): string | undefined {
  if (url == null) return undefined;
  if (url === "") return "";
  if (!/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("data:") || url.startsWith("blob:")) return url;

  const base = getPublicSiteUrl();
  if (!base) return url;

  try {
    const u = new URL(url);
    if (isLocalHostname(u.hostname)) {
      return `${base}${u.pathname}${u.search}${u.hash}`;
    }
  } catch {
    return url;
  }
  return url;
}
