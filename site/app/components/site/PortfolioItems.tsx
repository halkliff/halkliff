import Link from 'next/link';
import { ArrowUpRight, Clock3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { Typography } from '../ui/typography';

export type ExperienceItem = {
  period: string;
  company: string;
  role: string;
  summary: string;
  mark: string;
};

export function ExperienceRow({ item }: { item: ExperienceItem }) {
  return (
    <article className="relative grid items-start gap-6 border-b border-[rgba(23,25,22,0.2)] py-[52px] pb-[30px] [grid-template-columns:minmax(418px,0.7fr)_minmax(300px,1fr)] max-lg:gap-4 max-lg:[grid-template-columns:minmax(328px,0.85fr)_minmax(220px,1.15fr)] max-md:grid-cols-1 max-md:gap-4 max-md:pt-[50px]">
      <div className="grid items-center gap-6 [grid-template-columns:88px_42px_minmax(240px,1fr)] max-lg:gap-4 max-lg:[grid-template-columns:70px_36px_minmax(190px,1fr)] max-md:grid-cols-[70px_34px_1fr] max-md:gap-3">
        <Typography
          as="div"
          className="text-[9px] tracking-[0.07em]"
          variant="codeLabel"
        >
          {item.period}
        </Typography>
        <div className="flex h-8 w-8 items-center justify-center bg-[var(--ink)] font-[family-name:var(--font-mono)] text-[8px] text-[var(--paper)]">
          {item.mark}
        </div>
        <div>
          <Typography
            as="span"
            className="absolute left-[calc(88px+24px+42px+24px)] top-[18px] text-[9px] tracking-[0.07em] text-[var(--muted)] max-lg:left-[calc(70px+16px+36px+16px)] max-md:right-0 max-md:left-[calc(70px+12px+34px+12px)] max-md:top-4"
            variant="codeLabel"
          >
            {item.company}
          </Typography>
          <Typography
            as="h3"
            className="m-0 text-[clamp(20px,2vw,28px)] font-[560] tracking-[-0.035em]"
            variant="h3"
          >
            {item.role}
          </Typography>
        </div>
      </div>
      <Typography
        as="p"
        className="m-0 max-w-[620px] text-[13px] leading-[1.65] text-[var(--muted)] max-md:col-start-1 max-md:ml-32"
        variant="body"
      >
        {item.summary}
      </Typography>
    </article>
  );
}

export type ProjectItem = {
  number: string;
  status: string;
  title: string;
  subtitle: string;
  description: string;
  tags: readonly string[];
  href: string;
};

export function ProjectCard({ project }: { project: ProjectItem }) {
  return (
    <a
      className="project-card group relative min-h-[560px] border border-[var(--dark-line)] border-r-0 p-[clamp(22px,3vw,38px)] transition-[background-color,color] duration-[180ms] last:border-r hover:bg-[var(--acid)] hover:text-[var(--accent-contrast)] max-md:block max-md:min-h-[470px] max-md:border-b-0 max-md:border-r max-md:last:border-b"
      href={project.href}
    >
      <div className="project-card-top flex items-center justify-between text-[#777d73] transition-colors group-hover:text-[var(--accent-contrast)]">
        <Typography
          as="span"
          className="text-[8px] tracking-[0.09em]"
          variant="codeLabel"
        >
          {project.number}
        </Typography>
        <Typography
          as="small"
          className="border border-current px-1.5 py-1 text-[7px]"
          variant="caption"
        >
          {project.status}
        </Typography>
      </div>
      <div
        aria-hidden="true"
        className="project-glyph mt-16 mb-[46px] flex h-[66px] w-[66px] rotate-[-2deg] items-center justify-center border border-[#565c53] font-[family-name:var(--font-mono)] text-[18px] text-[var(--acid)] transition-colors group-hover:border-[var(--accent-contrast)] group-hover:text-[var(--accent-contrast)]"
      >
        {project.title
          .split(' ')
          .map((word) => word[0])
          .join('')
          .slice(0, 2)}
      </div>
      <Typography
        as="h3"
        className="m-0 text-[clamp(30px,3vw,46px)] font-[550] leading-none tracking-[-0.05em]"
        variant="h3"
      >
        {project.title}
      </Typography>
      <Typography
        as="strong"
        className="mt-3 block text-[13px] font-[520] text-[#b9bdb4] transition-colors group-hover:text-[var(--accent-contrast)]"
        variant="body"
      >
        {project.subtitle}
      </Typography>
      <Typography
        as="p"
        className="my-6 max-w-[380px] text-[12px] leading-[1.65] text-[#858b81] transition-colors group-hover:text-[var(--accent-contrast)]"
        variant="body"
      >
        {project.description}
      </Typography>
      <div className="project-tags flex flex-wrap gap-1.5">
        {project.tags.map((tag) => (
          <Badge
            className="rounded-none border-[#3a3f39] bg-transparent px-1.5 py-1 font-[family-name:var(--font-mono)] text-[7px] tracking-[0.07em] text-[#888e83] shadow-none transition-colors group-hover:border-[rgba(23,25,22,0.35)] group-hover:text-[var(--accent-contrast)]"
            key={tag}
            variant="outline"
          >
            {tag}
          </Badge>
        ))}
      </div>
      <Typography
        as="b"
        className="absolute bottom-[34px] left-[clamp(22px,3vw,38px)] inline-flex items-center gap-1.5 text-[8px] font-normal tracking-[0.08em]"
        variant="codeLabel"
      >
        OPEN PROJECT{' '}
        <ArrowUpRight
          aria-hidden="true"
          className="size-3"
        />
      </Typography>
    </a>
  );
}

export type NoteItem = {
  index: string;
  tag: string;
  title: string;
  excerpt: string;
  meta: string;
  href: string;
  disabled?: boolean;
};

export function NoteRow({ note }: { note: NoteItem }) {
  const className = cn(
    'group grid min-h-[128px] grid-cols-[36px_78px_minmax(0,1fr)_130px_26px] items-center gap-6 border-b border-[var(--line)] py-5 transition-[background-color,padding,opacity] duration-[180ms] max-md:grid-cols-[28px_minmax(0,1fr)_24px] max-md:gap-3 max-md:min-h-[130px]',
    note.disabled
      ? 'cursor-not-allowed opacity-55'
      : 'hover:bg-[rgba(255,255,255,0.28)] hover:px-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--acid)]',
  );

  const content = (
    <>
      <Typography
        as="span"
        className="text-[9px] tracking-[0.08em]"
        variant="codeLabel"
      >
        {note.index}
      </Typography>
      <Typography
        as="span"
        className="border border-[var(--line)] px-[7px] py-[5px] text-center text-[9px] tracking-[0.08em] max-md:hidden"
        variant="codeLabel"
      >
        {note.tag}
      </Typography>
      <span className="min-w-0">
        <Typography
          as="strong"
          className="block text-[clamp(19px,2vw,28px)] font-[560] tracking-[-0.035em]"
          variant="h3"
        >
          {note.title}
        </Typography>
        <Typography
          as="small"
          className="mt-2 block text-[13px] leading-[1.5] text-[var(--muted)] max-md:text-[12px]"
          variant="body"
        >
          {note.excerpt}
        </Typography>
      </span>
      <Typography
        as="span"
        className="text-[9px] tracking-[0.08em] text-[var(--muted)] max-md:hidden"
        variant="codeLabel"
      >
        {note.meta}
      </Typography>
      {note.disabled ? (
        <Clock3
          aria-hidden="true"
          className="size-[16px] text-[var(--muted)]"
        />
      ) : (
        <ArrowUpRight
          aria-hidden="true"
          className="size-[17px] transition-transform duration-[180ms] group-hover:translate-x-[3px] group-hover:-translate-y-[3px]"
        />
      )}
    </>
  );

  if (note.disabled) {
    return (
      <div
        aria-disabled="true"
        className={className}
        data-disabled="true"
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      className={className}
      href={note.href}
    >
      {content}
    </Link>
  );
}

export type PrincipleItem = {
  number: string;
  title: string;
  description: string;
};

export function PrincipleCard({ principle }: { principle: PrincipleItem }) {
  return (
    <article className="min-h-[360px] border-l border-[rgba(23,25,22,0.35)] px-[clamp(24px,3.5vw,54px)] first:border-l-0 first:pl-0 max-md:min-h-0 max-md:border-l-0 max-md:border-t max-md:border-[rgba(23,25,22,0.3)] max-md:px-0 max-md:py-7 max-md:pb-[50px]">
      <Typography
        as="span"
        className="text-[11px]"
        variant="codeLabel"
      >
        {principle.number}
      </Typography>
      <Typography
        as="h3"
        className="mt-[70px] mb-6 text-[clamp(30px,3vw,46px)] font-[560] tracking-[-0.05em] max-md:mt-[35px] max-md:mb-5"
        variant="h3"
      >
        {principle.title}
      </Typography>
      <Typography
        as="p"
        className="max-w-[360px] text-[15px] leading-[1.7]"
        variant="body"
      >
        {principle.description}
      </Typography>
    </article>
  );
}
