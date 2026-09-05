/**
 * Shared, self-contained metadata contract for every published field note.
 *
 * Keep this export independent from the generated field-note manifest so an
 * entry can declare and validate its own metadata from its `page.tsx`.
 */
export interface BlogPostMetadata {
  /** Stable ordering used by the generated field-note manifest. */
  order: number;
  /** Public route segment without the `/blog/` prefix. */
  slug: string;
  title: string;
  description: string;
  /** Editorial display date, such as `JUL 30, 2026`. */
  date: string;
  /** ISO-8601 publication timestamp consumed by article metadata and JSON-LD. */
  publishedTime: string;
  category: string;
  status: string;
  tags: readonly string[];
  wordCount: number;
  readingTime: string;
  /** Marks a deliberately disclosed showcase entry rather than an authored note. */
  showcase: boolean;
}
