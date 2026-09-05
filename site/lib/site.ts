/**
 * Canonical site configuration used by metadata, feeds, and structured data.
 *
 * Keep the review mirror out of canonical URLs by setting NEXT_PUBLIC_SITE_URL
 * only to the production site. The fallback matches Halk's canonical domain.
 */
const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://halkliff.dev";

export const siteUrl = new URL(configuredSiteUrl);

export function absoluteUrl(path = "/") {
  return new URL(path, siteUrl).toString();
}

/** Serialize JSON-LD without allowing a closing script tag to be injected. */
export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
