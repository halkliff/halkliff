import type { MetadataRoute } from "next";
import { fieldNotes } from "@/app/(blog)/components/field-notes";
import { absoluteUrl } from "@/lib/site";

const siteLastModified = new Date("2026-07-30T00:00:00.000Z");

/** Routes that should be discoverable by search engines.
 *
 * The field-note entries are the same generated registry used by the index.
 * Its public paths come from the nested route directories, while numbered
 * route groups remain an implementation-only ordering mechanism.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl("/"),
      lastModified: siteLastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: absoluteUrl("/blog"),
      lastModified: siteLastModified,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    ...fieldNotes.map((note) => ({
      url: absoluteUrl(note.slug),
      lastModified: new Date(note.publishedTime),
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
  ];
}
