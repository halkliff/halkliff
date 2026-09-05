/**
 * Count prose words from an MDX source file without charging readers for
 * component syntax or fenced code. This runs in the server/build path so the
 * rendered article can expose a stable reading-time label to crawlers.
 */
export function countMdxWords(source: string): number {
  const prose = source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/^[ \t]*(?:import|export)\b[^\n]*$/gm, " ")
    .replace(/\{[^{}]*\}/g, " ");

  return prose.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu)?.length ?? 0;
}

export function formatReadingTime(wordCount: number, wordsPerMinute = 220): string {
  const minutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  return `${minutes} MIN READ`;
}
