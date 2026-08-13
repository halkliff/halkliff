import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const contentFrameVariants = cva('mx-auto w-full', {
  variants: {
    size: {
      wide: 'max-w-[1600px]',
      workbench: 'max-w-[1380px]',
      blog: 'max-w-[1240px] lg:max-w-[1600px]',
      article: 'max-w-[1240px] lg:max-w-[1600px]',
    },
  },
  defaultVariants: {
    size: 'wide',
  },
});

type ContentFrameProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof contentFrameVariants>;

/** Keeps site chrome and content centered on large and ultrawide canvases. */
export function ContentFrame({ className, size, ...props }: ContentFrameProps) {
  return (
    <div
      className={cn(contentFrameVariants({ size }), className)}
      {...props}
    />
  );
}
