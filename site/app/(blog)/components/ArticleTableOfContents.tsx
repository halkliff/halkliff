import { Typography } from '@/app/components/ui/typography';

export interface ArticleTableOfContentsItem {
  href: `#${string}`;
  label: string;
}

interface ArticleTableOfContentsProps {
  items: readonly ArticleTableOfContentsItem[];
  prerequisites?: string;
}

/** Reusable, deliberately narrow navigation rail for long-form field notes. */
export function ArticleTableOfContents({
  items,
  prerequisites = 'None. Curiosity helps.',
}: ArticleTableOfContentsProps) {
  return (
    <aside
      aria-label="On this page"
      className="sticky top-[110px] flex w-[180px] self-start flex-col gap-[11px] max-md:hidden"
    >
      <Typography
        as="span"
        className="mb-[7px] text-[8px] tracking-[0.11em] text-[var(--muted)] uppercase"
        variant="codeLabel"
      >
        ON THIS PAGE
      </Typography>
      {items.map((item) => (
        <a
          className="hover:text-[var(--ink)]"
          href={item.href}
          key={item.href}
        >
          <Typography
            as="span"
            className="text-[11px] leading-[1.4] text-[var(--muted)]"
            variant="articleMeta"
          >
            {item.label}
          </Typography>
        </a>
      ))}
      <div className="my-[18px] h-px bg-[var(--line)]" />
      <Typography
        as="p"
        className="m-0 flex flex-col text-[10px] leading-[1.5] text-[var(--muted)]"
        variant="articleMeta"
      >
        <Typography
          as="span"
          className="mb-[7px] text-[8px] tracking-[0.11em] text-[var(--muted)] uppercase"
          variant="codeLabel"
        >
          PREREQUISITES
        </Typography>
        {prerequisites}
      </Typography>
    </aside>
  );
}
