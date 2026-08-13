import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { AppearanceControls } from '@/app/components/AppearanceControls';
import { ContentFrame } from '@/app/components/site/ContentFrame';
import { Typography } from '@/app/components/ui/typography';
import { BlogBackLink } from './BlogBackLink';
import { ReadingProgress } from './ReadingProgress';

export interface BlogNavProps {
  backHref?: string;
  backLabel?: string;
}

export function BlogNav({
  backHref = '/blog',
  backLabel = 'Back to field notes',
}: BlogNavProps) {
  return (
    <header className="article-nav blog-nav sticky top-0 z-20 border-b border-(--line) bg-[color-mix(in_srgb,var(--paper)_90%,transparent)] backdrop-blur-md">
      <ContentFrame
        className="grid h-17 grid-cols-[1fr_auto_1fr] items-center px-[clamp(20px,4vw,62px)] max-md:grid-cols-[1fr_auto] max-md:px-5"
        size="blog"
      >
        <div className="article-nav-links inline-flex min-w-0 items-center gap-5 max-md:gap-2">
          {backHref === '/blog' ? (
            <BlogBackLink />
          ) : (
            <Link
              className="article-back inline-flex items-center gap-1.5 hover:text-(--acid)"
              href={backHref}
            >
              <ArrowLeft
                aria-hidden="true"
                className="size-3"
              />
              <Typography
                as="span"
                className="text-[9px] tracking-[0.07em] uppercase"
                variant="codeLabel"
              >
                {backLabel}
              </Typography>
            </Link>
          )}
        </div>
        <Link
          className="article-nav-label hover:text-(--acid) max-md:hidden"
          href="/blog"
        >
          <Typography
            as="span"
            className="text-[8px] tracking-[0.11em] uppercase"
            variant="codeLabel"
          >
            FIELD NOTES BY HALK
          </Typography>
        </Link>
        <div className="article-nav-tools inline-flex items-center justify-self-end gap-5 max-md:gap-0">
          <AppearanceControls
            labelClassName="max-[1060px]:hidden"
            placement="header"
          />
          <ReadingProgress />
        </div>
      </ContentFrame>
    </header>
  );
}

export function BlogFooter() {
  return (
    <footer className="article-footer blog-footer border-t border-[var(--line)]">
      <ContentFrame
        className="grid grid-cols-[1fr_auto_auto] items-end gap-7 px-[clamp(20px,4vw,62px)] pt-[38px] pb-[54px] lg:px-0 max-md:grid-cols-1 max-md:items-start"
        size="blog"
      >
        <div className="grid gap-2">
          <Typography
            as="span"
            className="text-[8px] tracking-[0.1em] text-[var(--muted)] uppercase"
            variant="codeLabel"
          >
            FIELD NOTES / EOF
          </Typography>
          <Typography
            as="strong"
            className="text-[18px] font-[520]"
            variant="large"
          >
            Keep pulling on the thread.
          </Typography>
        </div>
        <nav
          aria-label="Field note navigation"
          className="grid gap-2 max-md:mt-2"
        >
          <Link
            className="inline-flex items-center gap-1 border-b border-[var(--line)] pb-[3px] hover:border-[var(--acid)] hover:text-[var(--acid)]"
            href="/blog"
          >
            <Typography
              as="span"
              className="text-[8px] tracking-[0.1em] uppercase"
              variant="codeLabel"
            >
              All field notes
            </Typography>
            <ArrowUpRight
              aria-hidden="true"
              className="inline size-3"
            />
          </Link>
          <Link
            className="inline-flex items-center gap-1 border-b border-[var(--line)] pb-[3px] hover:border-[var(--acid)] hover:text-[var(--acid)]"
            href="/"
          >
            <Typography
              as="span"
              className="text-[8px] tracking-[0.1em] uppercase"
              variant="codeLabel"
            >
              The workbench
            </Typography>
            <ArrowUpRight
              aria-hidden="true"
              className="inline size-3"
            />
          </Link>
        </nav>
        <AppearanceControls placement="header" />
      </ContentFrame>
    </footer>
  );
}
