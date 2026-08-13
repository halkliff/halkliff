import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Metadata } from 'next';
import Image from 'next/image';
import { ContentFrame } from '@/app/components/site/ContentFrame';
import { Typography } from '@/app/components/ui/typography';
import { ArticleNextNavigation } from '@/app/(blog)/components/ArticleNextNavigation';
import { ArticleTableOfContents } from '@/app/(blog)/components/ArticleTableOfContents';
import { ArticleAlert } from '@/app/(blog)/components/ArticleAlert';
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
    'An AI-written workbench showcase using interactive MDX, local code notebooks, and custom memory visualizations.',
  date: 'JUL 30, 2026',
  publishedTime: '2026-07-30T00:00:00.000Z',
  category: 'MEMORY / SYSTEMS',
  status: 'AI-WRITTEN SHOWCASE',
  showcase: true,
  tags: ['React', 'JavaScript', 'Rust', 'Memory', 'Systems engineering'],
  wordCount: articleWordCount,
  readingTime: formatReadingTime(articleWordCount),
} as const;

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

export default function MemoryLayoutArticle() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />

      <article>
        <header>
          <ContentFrame
            className="border-b border-(--line) px-[clamp(20px,4vw,62px)] pt-[clamp(82px,10vw,148px)] pb-14"
            size="blog"
          >
            <Typography
              as="div"
              className="flex items-center gap-2.5 text-[9px] tracking-[0.11em] uppercase"
              variant="codeLabel"
            >
              <span>FIELD NOTE {String(post.order).padStart(2, '0')}</span>
              <i className="block h-px w-[30px] bg-[var(--ink)]" />
              <span>MEMORY</span>
            </Typography>
            <Typography
              as="h1"
              className="my-10 max-w-[1030px] text-[clamp(54px,8vw,118px)] font-[540] leading-[0.88] tracking-[-0.075em] lg:max-w-[1320px] lg:text-[clamp(118px,5.8vw,138px)]"
              variant="articleDisplay"
            >
              {post.title}
            </Typography>
            <Typography
              className="m-0 max-w-[860px] text-[clamp(20px,2.2vw,30px)] leading-[1.45] text-muted lg:max-w-[1040px] lg:text-[34px]"
              variant="articleDeck"
            >
              You already understand trees, identity, and expensive updates.
              Let’s use that intuition to see what a computer sees: addresses,
              bytes, alignment, and one surprisingly useful lie.
            </Typography>
            <div className="mt-10 flex items-center justify-between max-md:flex-col max-md:items-start max-md:gap-6">
              <div className="flex items-center gap-3">
                <span className="block h-9 w-9 overflow-hidden rounded-full border border-(--line)">
                  <Image
                    alt="Werberth Lins"
                    className="h-full w-full object-cover"
                    height={38}
                    src="/profile-photo.webp"
                    width={38}
                  />
                </span>
                <Typography
                  as="p"
                  className="m-0"
                  variant="articleByline"
                >
                  <Typography
                    as="strong"
                    className="block text-[12px]"
                    variant="articleByline"
                  >
                    Werberth Lins
                  </Typography>
                  <Typography
                    as="span"
                    className="mt-1 block text-[8px] text-muted"
                    variant="articleMeta"
                  >
                    Lead SWE · Web to systems
                  </Typography>
                </Typography>
              </div>
              <div className="flex items-center gap-6 text-[8px] tracking-[0.08em] max-md:flex-wrap max-md:gap-3">
                <Typography
                  as="span"
                  variant="articleMeta"
                >
                  {post.date}
                </Typography>
                <Typography
                  as="span"
                  variant="articleMeta"
                >
                  {post.readingTime}
                </Typography>
                <Typography
                  as="span"
                  className="bg-(--acid) px-2 py-1"
                  variant="codeLabel"
                >
                  {post.status}
                </Typography>
              </div>
            </div>
            <ArticleAlert
              className="mt-10"
              title="WORKBENCH SHOWCASE"
              variant="note"
            >
              This is an AI-written test post—not part of the editorial catalog.
              It exists to demonstrate the portfolio workbench: interactive MDX,
              browser-local code notebooks, reusable article components, and
              custom technical visualizations.
            </ArticleAlert>
          </ContentFrame>
        </header>

        <ContentFrame
          className="grid grid-cols-1 px-5 pt-12 pb-24 md:grid-cols-[150px_minmax(0,1fr)_minmax(0,1fr)] md:gap-8 md:px-8 md:pt-16 xl:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)] xl:gap-12 xl:px-10 2xl:grid-cols-[180px_minmax(0,820px)_180px] 2xl:justify-center"
          size="article"
        >
          <ArticleTableOfContents items={tableOfContents} />

          <div
            className={cn(
              'prose min-w-0 text-[17px] leading-[1.82] text-(--ink) md:col-start-2 md:col-end-4 md:text-[18px] 2xl:col-end-3 [&>blockquote]:my-12 [&>blockquote]:-mx-10 [&>blockquote]:py-10 [&>blockquote]:leading-tight [&>p]:mb-8 [&>p:last-child]:mb-0 [&>pre]:my-10 [&>pre]:p-8 [&>ul]:my-9 [&>ul]:p-0 [&_li]:py-3 [&_li]:pl-6 max-md:[&>blockquote]:mx-0',
              styles.prose,
            )}
          >
            <PostContent />

            <ArticleNextNavigation
              upcoming={{
                description:
                  'Ownership through the lens of component boundaries, shared state, and the bugs we have learned to tolerate.',
                title: 'The borrow checker is a design reviewer.',
              }}
            />
          </div>
        </ContentFrame>
      </article>
    </>
  );
}
