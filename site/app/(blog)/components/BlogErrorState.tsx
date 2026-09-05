'use client';

import Link from 'next/link';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { Typography } from '@/app/components/ui/typography';

export interface BlogErrorStateProps {
  title: string;
  description: string;
  reset?: () => void;
}

export function BlogErrorState({
  description,
  reset,
  title,
}: BlogErrorStateProps) {
  return (
    <main className="mx-auto flex min-h-screen max-md: flex-col justify-center gap-5 px-5 py-20">
      <Typography
        as="p"
        className="m-0 text-[9px] tracking-[0.11em] text-[var(--muted)] uppercase"
        variant="codeLabel"
      >
        FIELD NOTES / SYSTEM MESSAGE
      </Typography>
      <Typography
        as="h1"
        className="m-0 text-[clamp(42px,7vw,76px)] font-[540] leading-[0.95] tracking-[-0.07em]"
        variant="articleDisplay"
      >
        {title}
      </Typography>
      <Typography
        as="p"
        className="m-0 text-[20px] leading-[1.45] text-[var(--muted)]"
        variant="articleDeck"
      >
        {description}
      </Typography>
      <div className="flex flex-wrap items-center gap-4">
        {reset ? (
          <button
            className="border border-[var(--line)] px-4 py-3 font-[family-name:var(--font-mono)] text-[9px] tracking-[0.08em] uppercase hover:border-[var(--acid)] hover:text-[var(--acid)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--acid)]"
            onClick={reset}
            type="button"
          >
            <Typography
              as="span"
              className="inline-flex items-center gap-2"
              variant="codeLabel"
            >
              <RotateCcw
                aria-hidden="true"
                className="size-3"
              />{' '}
              Try again
            </Typography>
          </button>
        ) : null}
        <Link
          className="border-b border-[var(--line)] pb-1 font-[family-name:var(--font-mono)] text-[9px] tracking-[0.08em] uppercase hover:border-[var(--acid)] hover:text-[var(--acid)]"
          href="/blog"
        >
          <Typography
            as="span"
            className="inline-flex items-center gap-2"
            variant="codeLabel"
          >
            Return to field notes{' '}
            <ArrowRight
              aria-hidden="true"
              className="size-3"
            />
          </Typography>
        </Link>
      </div>
    </main>
  );
}
