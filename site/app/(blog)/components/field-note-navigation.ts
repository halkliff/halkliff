export interface FieldNoteNavigationEntry {
  slug: string;
}

function normalizeFieldNoteSlug(slug: string) {
  return slug.startsWith("/blog/") ? slug : `/blog/${slug}`;
}

/**
 * Resolves adjacent published entries without knowing how their metadata is
 * loaded. Keeping this pure makes the ordering contract cheap to test.
 */
export function getFieldNoteNavigationFromNotes<
  Note extends FieldNoteNavigationEntry,
>(notes: readonly Note[], currentSlug: string) {
  const currentIndex = notes.findIndex(
    (note) => note.slug === normalizeFieldNoteSlug(currentSlug),
  );

  if (currentIndex === -1) {
    throw new Error(`The ${currentSlug} field note is missing.`);
  }

  return {
    previous: notes[currentIndex - 1],
    next: notes[currentIndex + 1],
  };
}
