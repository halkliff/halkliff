import type { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Typography } from '../ui/typography';

const sectionIntroVariants = cva(
  'grid items-end gap-20 [grid-template-columns:1.4fr_0.6fr] lg:grid-cols-1 lg:items-start lg:gap-8 max-md:block',
  {
    variants: {
      variant: {
        experience: 'mb-16 mt-[76px]',
        projects: 'mb-16 mt-[76px]',
        writing: 'mb-[68px]',
      },
    },
    defaultVariants: {
      variant: 'experience',
    },
  },
);

const eyebrowVariants = cva(
  "eyebrow m-0 mb-6 font-[family-name:var(--font-mono)] text-[11px] font-semibold tracking-[0.14em] before:mr-2.5 before:inline-block before:h-[7px] before:w-[7px] before:content-['']",
  {
    variants: {
      variant: {
        experience: 'before:bg-[var(--ink)]',
        projects: 'before:bg-[var(--acid)]',
        writing: 'before:bg-[var(--ink)]',
      },
    },
    defaultVariants: {
      variant: 'experience',
    },
  },
);

const titleVariants = cva('m-0 border-b-0 p-0 leading-[0.98]', {
  variants: {
    variant: {
      experience:
        'max-w-[840px] text-[clamp(42px,5.4vw,78px)] font-[530] tracking-[-0.06em] lg:max-w-none lg:text-[clamp(78px,4.5vw,96px)]',
      projects:
        'text-[clamp(42px,5.4vw,78px)] font-[530] tracking-[-0.06em] lg:max-w-none lg:text-[clamp(78px,4vw,88px)]',
      writing:
        'max-w-[800px] text-[clamp(44px,6vw,86px)] font-[520] tracking-[-0.065em] lg:max-w-none lg:text-[clamp(86px,4.8vw,104px)]',
    },
  },
  defaultVariants: {
    variant: 'experience',
  },
});

const descriptionVariants = cva('m-0 text-[15px] leading-[1.7] max-md:mt-7', {
  variants: {
    variant: {
      experience:
        'max-w-[410px] text-[var(--muted)] lg:max-w-[900px] lg:text-[18px]',
      projects: 'max-w-[410px] text-[#91968c] lg:max-w-[900px] lg:text-[18px]',
      writing:
        'max-w-[390px] text-[var(--muted)] lg:max-w-[900px] lg:text-[18px]',
    },
  },
  defaultVariants: {
    variant: 'experience',
  },
});

type SectionIntroProps = {
  eyebrow: ReactNode;
  title: ReactNode;
  description: ReactNode;
  className?: string;
} & VariantProps<typeof sectionIntroVariants>;

/** Keeps the editorial heading/description pair consistent across sections. */
export function SectionIntro({
  eyebrow,
  title,
  description,
  className,
  variant,
}: SectionIntroProps) {
  return (
    <div className={cn(sectionIntroVariants({ variant }), className)}>
      <div>
        <Typography
          as="p"
          className={eyebrowVariants({ variant })}
          variant="codeLabel"
        >
          {eyebrow}
        </Typography>
        <Typography
          as="h2"
          className={titleVariants({ variant })}
          variant="h2"
        >
          {title}
        </Typography>
      </div>
      <Typography
        as="p"
        className={descriptionVariants({ variant })}
        variant="body"
      >
        {description}
      </Typography>
    </div>
  );
}
