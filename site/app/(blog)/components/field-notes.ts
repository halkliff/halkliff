import { blogEntries } from "./blog-entry-manifest";

export interface FieldNote {
  order: number;
  slug: string;
  title: string;
  description: string;
  date: string;
  publishedTime: string;
  category: string;
  status: string;
  tags: readonly string[];
  wordCount: number;
  readingTime: string;
  showcase: boolean;
}

function loadFieldNote({
  directory: directoryName,
  publicSlug,
  post: metadata,
}: (typeof blogEntries)[number]): FieldNote {
  const expectedDirectoryName = `(${String(metadata.order).padStart(2, "0")}_${metadata.slug})`;
  if (directoryName !== expectedDirectoryName) {
    throw new Error(
      `Field note directory ${directoryName} does not match ${expectedDirectoryName}.`,
    );
  }

  if (publicSlug !== metadata.slug) {
    throw new Error(
      `Field note route ${publicSlug} does not match its exported slug ${metadata.slug}.`,
    );
  }

  return {
    ...metadata,
    slug: `/blog/${publicSlug}`,
  };
}

/** Build-time source of truth for the blog index, article metadata, and sitemap. */
export const fieldNotes = blogEntries
  .map((entry) => loadFieldNote(entry))
  .sort((a, b) => a.order - b.order);

function requireFieldNote(slug: string): FieldNote {
  const note = fieldNotes.find((entry) => entry.slug === slug);
  if (!note) {
    throw new Error(`The ${slug} field note is missing.`);
  }
  return note;
}

export const memoryLayoutNote = requireFieldNote(
  "/blog/memory-layout-for-react-devs",
);
