"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { NotebookLanguage } from "./types";

const SHIKI_LANGUAGES: Record<NotebookLanguage, string> = {
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  rust: "rust",
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function plainMarkup(source: string) {
  const lines = source
    .split("\n")
    .map((line) => `<span class="line">${escapeHtml(line) || " "}</span>`)
    .join("\n");

  return `<pre><code>${lines}</code></pre>`;
}

async function highlightMarkup(
  source: string,
  language: NotebookLanguage,
) {
  try {
    const { codeToHtml } = await import("shiki/bundle/web");
    return await codeToHtml(source, {
      lang: SHIKI_LANGUAGES[language],
      themes: {
        light: "catppuccin-latte",
        dark: "catppuccin-mocha",
      },
      defaultColor: false,
    });
  } catch {
    return plainMarkup(source);
  }
}

export interface CodeNotebookEditorProps {
  value: string;
  language: NotebookLanguage;
  onChange: (value: string) => void;
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  showLineNumbers?: boolean;
}

export function CodeNotebookEditor({
  value,
  language,
  onChange,
  ariaLabel,
  className,
  disabled = false,
  id,
  showLineNumbers = true,
}: CodeNotebookEditorProps) {
  const [highlightedMarkup, setHighlightedMarkup] = useState(() =>
    plainMarkup(value),
  );
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void highlightMarkup(value, language).then((markup) => {
        if (!cancelled) setHighlightedMarkup(markup);
      });
    }, 90);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [language, value]);

  function syncScroll(event: React.UIEvent<HTMLTextAreaElement>) {
    const highlight = highlightRef.current;

    if (highlight) {
      highlight.scrollTop = event.currentTarget.scrollTop;
      highlight.scrollLeft = event.currentTarget.scrollLeft;
    }
  }

  return (
    <div
      className={cn(
        "relative min-h-[248px] min-w-0 max-w-full overflow-hidden bg-[var(--syntax-surface)] [tab-size:2]",
        className,
      )}
      data-code-editor="true"
      data-language={language}
    >
      <div
        ref={highlightRef}
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 max-w-full overflow-auto",
          "[&>pre]:m-0! [&>pre]:min-h-[248px]! [&>pre]:border-0! [&>pre]:rounded-none! [&>pre]:bg-[var(--syntax-surface)]! [&>pre]:p-[18px_20px]! [&>pre]:font-[family-name:var(--font-code)]! [&>pre]:text-[13px]! [&>pre]:leading-[1.7]! [&>pre]:text-[var(--foreground)]! [&>pre]:whitespace-pre!",
          "[&>pre_span]:text-[color-mix(in_srgb,var(--shiki-light)_82%,var(--ink))]! dark:[&>pre_span]:text-[var(--shiki-dark)]!",
          showLineNumbers &&
            "[counter-reset:line] [&>pre]:pl-[60px]! [&_.line]:before:mr-4 [&_.line]:before:inline-block [&_.line]:before:w-6 [&_.line]:before:[counter-increment:line] [&_.line]:before:content-[counter(line)] [&_.line]:before:text-right [&_.line]:before:text-[10px] [&_.line]:before:text-muted-foreground",
        )}
        dangerouslySetInnerHTML={{ __html: highlightedMarkup }}
      />
      <textarea
        id={id}
        aria-label={ariaLabel ?? `${language} source`}
        aria-multiline="true"
        autoCapitalize="off"
        autoCorrect="off"
        className={cn(
          "relative z-[1] block min-h-[248px] w-full max-w-full resize-y overflow-auto border-0 bg-transparent px-5 py-[18px] font-[family-name:var(--font-code)] text-[13px] leading-[1.7] text-transparent caret-[var(--acid)] outline-none [tab-size:2] selection:bg-[color-mix(in_srgb,var(--acid)_35%,transparent)] selection:text-transparent disabled:cursor-not-allowed",
          showLineNumbers && "pl-[60px]",
        )}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        onScroll={syncScroll}
        spellCheck={false}
        value={value}
      />
    </div>
  );
}
