import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Metadata } from 'next';
import { ContentFrame } from '@/app/components/site/ContentFrame';
import { ArticleHeader } from '@/app/(blog)/components/ArticleHeader';
import { ArticleNextNavigation } from '@/app/(blog)/components/ArticleNextNavigation';
import { ArticleTableOfContents } from '@/app/(blog)/components/ArticleTableOfContents';
import { ArticleAlert } from '@/app/(blog)/components/ArticleAlert';
import type { BlogPostMetadata } from '@/app/(blog)/components/blog-post-metadata';
import { cn } from '@/lib/utils';
import { countMdxWords, formatReadingTime } from '@/lib/reading-time';
import { absoluteUrl, serializeJsonLd } from '@/lib/site';
import PostContent from './content.mdx';
import styles from './memory-layout.module.css';

const articleSource = readFileSync(
  join(
    process.cwd(),
    'app',
    '(blog)',
    'blog',
    '(entries)',
    '(01_memory-layout-for-react-devs)',
    'memory-layout-for-react-devs',
    'content.mdx',
  ),
  'utf8',
);
const articleWordCount = countMdxWords(articleSource);

/** The entry's metadata travels with the page that renders it. */
export const post = {
  order: 1,
  slug: 'memory-layout-for-react-devs',
  title: 'Memory layout for React developers',
  description:
    'An AI-written test post about memory layout, with interactive diagrams and code you can run in your browser.',
  date: 'JUL 30, 2026',
  publishedTime: '2026-07-30T00:00:00.000Z',
  category: 'MEMORY / SYSTEMS',
  status: 'AI-WRITTEN SHOWCASE',
  showcase: true,
  tags: ['React', 'JavaScript', 'Rust', 'Memory', 'Systems engineering'],
  wordCount: articleWordCount,
  readingTime: formatReadingTime(articleWordCount),
} as const satisfies BlogPostMetadata;

const publicPath = `/blog/${post.slug}`;

const tableOfContents = [
  { href: '#abstraction', label: 'The useful lie' },
  { href: '#contiguous', label: 'Contiguous means close' },
  { href: '#alignment', label: 'Alignment' },
  { href: '#react', label: 'Back to React' },
] as const;

export const revalidate = 300;

export const metadata: Metadata = {
  title: post.title,
  description: post.description,
  alternates: {
    canonical: publicPath,
  },
  openGraph: {
    title: post.title,
    description: post.description,
    type: 'article',
    url: publicPath,
    siteName: 'Halk — Werberth Lins',
    locale: 'en_US',
    publishedTime: post.publishedTime,
    authors: ['Werberth Lins'],
    section: 'Systems engineering',
    tags: [...post.tags],
    images: [
      {
        url: '/og.png',
        width: 1731,
        height: 909,
        alt: 'Memory layout for React developers — a field note by Halk',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: post.title,
    description: post.description,
    creator: '@halkliff',
    images: ['/og.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      'index': true,
      'follow': true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  '@id': absoluteUrl(`${publicPath}#article`),
  'headline': post.title,
  'description': post.description,
  'image': [absoluteUrl('/og.png')],
  'datePublished': post.publishedTime,
  'dateModified': post.publishedTime,
  'author': {
    '@type': 'Person',
    '@id': absoluteUrl('/#werberth-lins'),
    'name': 'Werberth Lins',
    'url': absoluteUrl('/'),
  },
  'publisher': {
    '@type': 'Person',
    '@id': absoluteUrl('/#werberth-lins'),
    'name': 'Werberth Lins',
  },
  'mainEntityOfPage': {
    '@type': 'WebPage',
    '@id': absoluteUrl(publicPath),
  },
  'isPartOf': {
    '@type': 'WebSite',
    '@id': absoluteUrl('/#website'),
  },
  'articleSection': 'Systems engineering',
  'keywords': post.tags.join(', '),
  'inLanguage': 'en-US',
  'isAccessibleForFree': true,
};

export default async function MemoryLayoutArticle() {
  // The generated manifest imports this page's `post` export. Loading it only
  // after this module has initialized preserves the single-page metadata model
  // while still giving article navigation the canonical published-note order.
  const { getFieldNoteNavigation, toFieldNoteLink } = await import(
    '@/app/(blog)/components/field-notes'
  );
  const { previous, next } = getFieldNoteNavigation(post.slug);
  const previousNavigation = previous
    ? { ...toFieldNoteLink(previous), href: previous.slug }
    : undefined;
  const nextNavigation = next
    ? { ...toFieldNoteLink(next), href: next.slug }
    : undefined;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />

      <article>
        <ArticleHeader>
          <ArticleHeader.Eyebrow>
            <span>FIELD NOTE {String(post.order).padStart(2, '0')}</span>
            <ArticleHeader.Divider />
            <span>MEMORY</span>
          </ArticleHeader.Eyebrow>

          <ArticleHeader.Title>{post.title}</ArticleHeader.Title>

          <ArticleHeader.Subtitle>
            Start with a familiar JavaScript array, then look at element sizes,
            consecutive addresses, and the padding between fields.
          </ArticleHeader.Subtitle>

          <ArticleHeader.Details>
            <ArticleHeader.Writer
              imageSrc="/profile-photo.webp"
              name="Werberth Lins"
              role="Lead SWE · Web to systems"
            />
            <ArticleHeader.Metadata>
              <ArticleHeader.Date dateTime={post.publishedTime}>
                {post.date}
              </ArticleHeader.Date>
              <ArticleHeader.ReadingTime>
                {post.readingTime}
              </ArticleHeader.ReadingTime>
              <ArticleHeader.Badge>{post.status}</ArticleHeader.Badge>
            </ArticleHeader.Metadata>
          </ArticleHeader.Details>

          <ArticleHeader.Extra>
            <ArticleAlert
              className="my-0"
              title="WORKBENCH SHOWCASE"
              variant="note"
            >
              This AI-written test post demonstrates the site&apos;s interactive
              diagrams, code notebooks, and article components. It is a test page
              outside the editorial catalog.
            </ArticleAlert>
          </ArticleHeader.Extra>
        </ArticleHeader>

        <ContentFrame
          className="grid grid-cols-1 px-5 pt-12 pb-24 md:grid-cols-[150px_minmax(0,1fr)_minmax(0,1fr)] md:gap-8 md:px-8 md:pt-16 xl:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)] xl:gap-12 xl:px-10 2xl:grid-cols-[180px_minmax(0,820px)_180px] 2xl:justify-center"
          size="article"
        >
          <ArticleTableOfContents items={tableOfContents} />

          <div
            className={cn(
              'prose min-w-0 text-[17px] leading-[1.82] text-(--ink) md:col-start-2 md:col-end-4 md:text-[18px] 2xl:col-end-3 [&>blockquote]:my-12 [&>blockquote]:py-8 [&>blockquote]:leading-tight [&>p]:mb-8 [&>p:last-child]:mb-0 [&>pre]:my-10 [&>pre]:p-8 [&>ul]:my-9 [&>ul]:p-0 [&_li]:py-3 [&_li]:pl-6 max-md:[&>blockquote]:mx-0',
              styles.prose,
            )}
          >
            <PostContent />

            <ArticleNextNavigation
              next={nextNavigation}
              previous={previousNavigation}
              upcoming={
                next
                  ? undefined
                  : {
                      description:
                        'Abstraction helps us change code. The runtime still has to do the work that survives optimization: allocate, chase pointers, make indirect calls, synchronize, parse again, and copy data.',
                      title: 'Congratulations! Your abstraction is on the hot path',
                    }
              }
            />
          </div>
        </ContentFrame>
      </article>
    </>
  );
}
