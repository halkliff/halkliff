import { describe, expect, it } from "vitest";
import { calculateReadingProgress } from "@/app/(blog)/components/ReadingProgress";
import { detectKeyboardPlatform } from "@/app/components/ui/kbd";
import { getFieldNoteNavigationFromNotes } from "@/app/(blog)/components/field-note-navigation";
import { countMdxWords, formatReadingTime } from "@/lib/reading-time";

describe("reusable presentation logic", () => {
  it("counts prose without charging for MDX plumbing or fenced code", () => {
    const source = `import Widget from './Widget'\n\nHello curious builder.\n\n\`\`\`ts\nconst ignored = true\n\`\`\`\n\n<Widget value={42} />`;
    expect(countMdxWords(source)).toBe(3);
    expect(formatReadingTime(221, 220)).toBe("2 MIN READ");
  });

  it("selects the platform modifier without coupling callers to navigator", () => {
    expect(detectKeyboardPlatform("MacIntel Safari")).toBe("apple");
    expect(detectKeyboardPlatform("iPhone")).toBe("apple");
    expect(detectKeyboardPlatform("Win32 Chrome")).toBe("standard");
    expect(detectKeyboardPlatform("Linux x86_64")).toBe("standard");
  });

  it("clamps reading progress and handles documents without overflow", () => {
    expect(calculateReadingProgress(0, 2000, 1000)).toBe(0);
    expect(calculateReadingProgress(500, 2000, 1000)).toBe(50);
    expect(calculateReadingProgress(5000, 2000, 1000)).toBe(100);
    expect(calculateReadingProgress(-20, 2000, 1000)).toBe(0);
    expect(calculateReadingProgress(0, 800, 1000)).toBe(100);
  });

  it("derives adjacent published field notes from canonical order", () => {
    const notes = [
      {
        slug: "/blog/first",
        readingTime: "1 MIN READ",
      },
      {
        slug: "/blog/second",
        readingTime: "2 MIN READ",
      },
    ];

    expect(getFieldNoteNavigationFromNotes(notes, "second")).toMatchObject({
      previous: { slug: "/blog/first", readingTime: "1 MIN READ" },
      next: undefined,
    });
    expect(() => getFieldNoteNavigationFromNotes(notes, "missing")).toThrow(
      "The missing field note is missing.",
    );
  });
});
