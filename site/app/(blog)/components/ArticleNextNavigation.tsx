import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock3 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Typography } from "@/app/components/ui/typography";
import { BlogBackLink } from "./BlogBackLink";

export interface ArticleNavigationItem {
  description?: string;
  href: string;
  readingTime: string;
  title: string;
}

interface UpcomingArticle {
  description?: string;
  title: string;
}

interface ArticleNextNavigationProps {
  next?: ArticleNavigationItem;
  previous?: ArticleNavigationItem;
  upcoming?: UpcomingArticle;
}

function ArticleLink({ direction, item }: {
  direction: "next" | "previous";
  item: ArticleNavigationItem;
}) {
  const isPrevious = direction === "previous";

  return (
    <Button
      asChild
      className="h-auto min-h-28 w-full justify-start rounded-none border-[var(--line)] bg-transparent p-5 text-left whitespace-normal hover:border-[var(--acid)] hover:bg-[color-mix(in_srgb,var(--acid)_8%,transparent)]"
      variant="outline"
    >
      <Link href={item.href}>
        {isPrevious ? <ArrowLeft aria-hidden="true" className="size-4 shrink-0" /> : null}
        <span className="min-w-0">
          <Typography as="span" className="mb-2 block text-[10px] tracking-[0.1em] text-[var(--muted)] uppercase" variant="codeLabel">
            {isPrevious ? "Previous field note" : "Next field note"}
          </Typography>
          <Typography as="strong" className="block text-base leading-snug" variant="articleTitle">
            {item.title}
          </Typography>
          {item.description ? (
            <Typography as="span" className="mt-1.5 block text-sm font-normal text-[var(--muted)]" variant="articleBody">
              {item.description}
            </Typography>
          ) : null}
          <Typography as="span" className="mt-3 block text-[10px] tracking-[0.1em] text-[var(--muted)] uppercase" variant="codeLabel">
            {item.readingTime}
          </Typography>
        </span>
        {!isPrevious ? <ArrowRight aria-hidden="true" className="ml-auto size-4 shrink-0" /> : null}
      </Link>
    </Button>
  );
}

/** Previous/next field-note navigation with an explicit unpublished state. */
export function ArticleNextNavigation({
  next,
  previous,
  upcoming,
}: ArticleNextNavigationProps) {
  return (
    <nav
      aria-label="Field note navigation"
      className="mt-16"
    >
      {previous || next ? (
        <div className="grid grid-cols-2 gap-3 max-[640px]:grid-cols-1">
          {previous ? <ArticleLink direction="previous" item={previous} /> : null}
          {next ? <ArticleLink direction="next" item={next} /> : null}
        </div>
      ) : null}

      {upcoming ? (
        <Card
          aria-label={`${upcoming.title} is coming soon`}
          className="gap-0 rounded-none border-[var(--acid)] bg-[color-mix(in_srgb,var(--acid)_15%,var(--card))] p-7 shadow-none"
        >
          <Typography as="span" className="flex items-center gap-2 text-[10px] tracking-[0.11em] uppercase" variant="codeLabel">
            <Clock3 aria-hidden="true" className="size-3.5" />
            Coming soon
          </Typography>
          <Typography as="h3" className="mt-7 mb-2 text-[clamp(24px,4vw,34px)] leading-[1.1] tracking-[-0.04em]" variant="articleH3">
            {upcoming.title}
          </Typography>
          {upcoming.description ? (
            <Typography className="mb-5 text-sm leading-relaxed text-[var(--muted)]" variant="articleBody">
              {upcoming.description}
            </Typography>
          ) : null}
          <Button className="w-fit rounded-none" disabled variant="outline">
            <Typography as="span" variant="codeLabel">
              Not published yet
            </Typography>
          </Button>
        </Card>
      ) : null}

      <BlogBackLink className="mt-5" variant="action" />
    </nav>
  );
}
