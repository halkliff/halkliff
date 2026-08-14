import type {
  ComponentPropsWithoutRef,
  HTMLAttributes,
  ReactNode,
} from 'react';
import Image from 'next/image';
import { ContentFrame } from '@/app/components/site/ContentFrame';
import { Typography } from '@/app/components/ui/typography';
import { cn } from '@/lib/utils';

interface ArticleHeaderRootProps extends ComponentPropsWithoutRef<'header'> {
  contentClassName?: string;
}

function ArticleHeaderRoot({
  children,
  className,
  contentClassName,
  ...props
}: ArticleHeaderRootProps) {
  return (
    <header className={className} {...props}>
      <ContentFrame
        className={cn(
          'border-b border-(--line) px-[clamp(20px,4vw,62px)] pt-[clamp(82px,10vw,148px)] pb-14',
          contentClassName,
        )}
        size="blog"
      >
        {children}
      </ContentFrame>
    </header>
  );
}

function ArticleHeaderEyebrow({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  return (
    <Typography
      as="div"
      className={cn(
        'flex items-center gap-2.5 text-[9px] tracking-[0.11em] uppercase',
        className,
      )}
      variant="codeLabel"
      {...props}
    />
  );
}

function ArticleHeaderDivider({
  className,
  ...props
}: ComponentPropsWithoutRef<'i'>) {
  return (
    <i
      aria-hidden="true"
      className={cn('block h-px w-8 bg-(--ink)', className)}
      {...props}
    />
  );
}

function ArticleHeaderTitle({
  className,
  ...props
}: ComponentPropsWithoutRef<'h1'>) {
  return (
    <Typography
      as="h1"
      className={cn(
        'my-10 max-w-[1030px] text-[clamp(54px,8vw,118px)] font-[540] leading-[0.88] tracking-[-0.075em] lg:max-w-[1320px] lg:text-[clamp(118px,5.8vw,138px)]',
        className,
      )}
      variant="articleDisplay"
      {...props}
    />
  );
}

function ArticleHeaderSubtitle({
  className,
  ...props
}: ComponentPropsWithoutRef<'p'>) {
  return (
    <Typography
      as="p"
      className={cn(
        'm-0 max-w-[860px] text-[clamp(20px,2.2vw,30px)] leading-[1.45] text-muted lg:max-w-[1040px] lg:text-[34px]',
        className,
      )}
      variant="articleDeck"
      {...props}
    />
  );
}

function ArticleHeaderDetails({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={cn(
        'mt-10 flex items-center justify-between max-md:flex-col max-md:items-start max-md:gap-6',
        className,
      )}
      {...props}
    />
  );
}

export interface ArticleWriterProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  imageAlt?: string;
  imageSrc: string;
  name: ReactNode;
  role?: ReactNode;
}

export function ArticleWriter({
  className,
  imageAlt,
  imageSrc,
  name,
  role,
  ...props
}: ArticleWriterProps) {
  const accessibleName = typeof name === 'string' ? name : 'Article writer';

  return (
    <div className={cn('flex items-center gap-3', className)} {...props}>
      <span className="block size-9 shrink-0 overflow-hidden rounded-full border border-(--line)">
        <Image
          alt={imageAlt ?? accessibleName}
          className="size-full object-cover"
          height={38}
          src={imageSrc}
          width={38}
        />
      </span>
      <div>
        <Typography
          as="strong"
          className="block text-[12px]"
          variant="articleByline"
        >
          {name}
        </Typography>
        {role ? (
          <Typography
            as="span"
            className="mt-1 block text-[8px] text-muted"
            variant="articleMeta"
          >
            {role}
          </Typography>
        ) : null}
      </div>
    </div>
  );
}

function ArticleHeaderMetadata({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={cn(
        'flex items-center gap-6 text-[8px] tracking-[0.08em] max-md:flex-wrap max-md:gap-3',
        className,
      )}
      {...props}
    />
  );
}

function ArticleHeaderDate({
  className,
  ...props
}: ComponentPropsWithoutRef<'time'>) {
  return (
    <Typography
      as="time"
      className={className}
      variant="articleMeta"
      {...props}
    />
  );
}

function ArticleHeaderReadingTime({
  className,
  ...props
}: ComponentPropsWithoutRef<'span'>) {
  return (
    <Typography
      as="span"
      className={className}
      variant="articleMeta"
      {...props}
    />
  );
}

function ArticleHeaderBadge({
  className,
  ...props
}: ComponentPropsWithoutRef<'span'>) {
  return (
    <Typography
      as="span"
      className={cn('bg-(--acid) px-2 py-1', className)}
      variant="codeLabel"
      {...props}
    />
  );
}

function ArticleHeaderExtra({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  return <div className={cn('mt-10 mb-11', className)} {...props} />;
}

/** Compound field-note header composed from semantic, independently reusable slots. */
export const ArticleHeader = Object.assign(ArticleHeaderRoot, {
  Badge: ArticleHeaderBadge,
  Date: ArticleHeaderDate,
  Details: ArticleHeaderDetails,
  Divider: ArticleHeaderDivider,
  Extra: ArticleHeaderExtra,
  Eyebrow: ArticleHeaderEyebrow,
  Metadata: ArticleHeaderMetadata,
  ReadingTime: ArticleHeaderReadingTime,
  Subtitle: ArticleHeaderSubtitle,
  Title: ArticleHeaderTitle,
  Writer: ArticleWriter,
});
