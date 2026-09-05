import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { ContentFrame } from '@/app/components/site/ContentFrame';
import { Typography } from '@/app/components/ui/typography';
import { BlogFooter, BlogNav } from '../components/BlogChrome';
import { fieldNotes } from '../components/field-notes';

export const metadata: Metadata = {
  title: 'Field notes',
  description:
    'Notes on web development, distributed systems, memory, and systems programming.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Field notes — Halk',
    description:
      'Notes on web development, distributed systems, memory, and systems programming.',
    type: 'website',
    url: '/blog',
  },
};

export default function BlogIndex() {
  return (
    <main className="min-h-screen bg-[var(--paper)]">
      <BlogNav
        backHref="/"
        backLabel="Back to the workbench"
      />

      <section aria-labelledby="field-notes-title">
        <ContentFrame
          className="border-b border-[var(--line)] px-5 pt-[clamp(82px,10vw,148px)] pb-[76px] lg:px-0"
          size="blog"
        >
          <Typography
            as="p"
            className="m-0 flex items-center gap-2.5 text-[9px] tracking-[0.11em] uppercase"
            variant="codeLabel"
          >
            <span>01</span>
            <i className="block h-px w-[30px] bg-[var(--ink)]" />
            <span>WRITING</span>
          </Typography>
          <Typography
            as="h1"
            className="m-[38px_0_28px] max-w-[900px] text-[clamp(48px,7vw,104px)] font-[540] leading-[0.92] tracking-[-0.075em] lg:max-w-[1280px] lg:text-[clamp(104px,5.5vw,124px)] max-md:text-[clamp(48px,15vw,76px)]"
            id="field-notes-title"
            variant="display"
          >
            Field notes on web and systems programming.
          </Typography>
          <Typography
            className="m-0 max-w-[760px] text-[clamp(20px,2.2vw,30px)] leading-[1.45] text-[var(--muted)] lg:max-w-[980px] lg:text-[34px]"
            variant="deck"
          >
            Long-form notes on interfaces, distributed systems, memory, and the
            lower layers hiding underneath a good architecture.
          </Typography>
        </ContentFrame>
      </section>

      <section aria-label="Published field notes">
        <ContentFrame
          className="grid gap-0 px-5 pt-5 pb-[88px] lg:px-0"
          size="blog"
        >
          {fieldNotes.map((note) => (
            <article
              className="grid grid-cols-[60px_minmax(0,1fr)_auto] items-start gap-7 border-b border-[var(--line)] py-9 lg:grid-cols-[80px_minmax(0,1fr)_auto] lg:gap-10 lg:py-12 max-md:grid-cols-[34px_minmax(0,1fr)] max-md:gap-4"
              key={note.slug}
            >
              <Typography
                as="div"
                className="text-[9px] tracking-[0.08em] text-[var(--muted)]"
                variant="articleMeta"
              >
                {String(note.order).padStart(2, '0')}
              </Typography>
              <div className="min-w-0">
                <Typography
                  as="p"
                  className="m-0 text-[9px] tracking-[0.08em] text-[var(--muted)] uppercase"
                  variant="codeLabel"
                >
                  {note.category}
                </Typography>
                <Typography
                  as="h2"
                  className="mt-4 mb-3 text-[clamp(28px,4vw,54px)] font-[540] leading-none tracking-[-0.055em] lg:text-[64px]"
                  variant="articleTitle"
                >
                  {note.title}
                </Typography>
                <Typography
                  className="m-0 max-w-[670px] text-[18px] leading-[1.55] text-[var(--muted)] lg:max-w-[960px] lg:text-[21px]"
                  variant="articleBody"
                >
                  {note.description}
                </Typography>
                {note.showcase ? (
                  <Typography
                    as="p"
                    className="mt-4 border-l border-[var(--acid)] pl-3 text-[11px] text-[var(--muted)]"
                    variant="codeLabel"
                  >
                    AI-WRITTEN TEST POST · WORKBENCH CAPABILITY SHOWCASE
                  </Typography>
                ) : null}
                <div className="mt-6 flex flex-wrap gap-4 text-[9px] tracking-[0.08em] text-[var(--muted)]">
                  {[note.date, note.readingTime, note.status].map(
                    (value, index) => (
                      <Typography
                        as="span"
                        className={
                          index > 0
                            ? "before:mr-4 before:text-[var(--line)] before:content-['/']"
                            : undefined
                        }
                        key={value}
                        variant="articleMeta"
                      >
                        {value}
                      </Typography>
                    ),
                  )}
                </div>
              </div>
              <Link
                className="inline-flex items-center gap-3 justify-self-end border-b border-[var(--line)] pb-[5px] hover:border-[var(--acid)] hover:text-[var(--acid)] max-md:col-start-2 max-md:justify-self-start"
                href={note.slug}
              >
                <Typography
                  as="span"
                  variant="codeLabel"
                >
                  Read the note
                </Typography>
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-3"
                />
              </Link>
            </article>
          ))}
        </ContentFrame>
      </section>

      <BlogFooter />
    </main>
  );
}
