import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * A small, composable typography primitive for rendered Markdown and UI copy.
 *
 * The variants cover both the shadcn-style UI vocabulary and the explicit
 * editorial treatments used by field notes. Pass `as` when the semantic
 * element differs from the visual treatment.
 */
const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
      h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
      h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
      h4: "scroll-m-20 text-xl font-semibold tracking-tight",
      p: "leading-7 [&:not(:first-child)]:mt-6",
      body: "leading-7",
      lead: "text-xl text-muted-foreground",
      large: "text-lg font-semibold",
      small: "text-sm font-medium leading-none",
      muted: "text-sm text-muted-foreground",
      blockquote: "mt-6 border-l-2 pl-6 italic",
      list: "my-6 ml-6 list-disc [&>li]:mt-2",
      inlineCode:
        "relative rounded-sm border border-border bg-muted px-1 py-0.5 font-mono text-sm font-semibold",

      // Editorial serif variants. These are deliberately explicit so a
      // prose treatment never depends on a page-level selector.
      articleDisplay:
        "font-serif text-5xl font-semibold leading-tight tracking-tight lg:text-6xl",
      display:
        "font-serif text-5xl font-semibold leading-tight tracking-tight lg:text-6xl",
      articleTitle:
        "font-serif text-4xl font-semibold leading-tight tracking-tight lg:text-5xl",
      title:
        "font-serif text-4xl font-semibold leading-tight tracking-tight lg:text-5xl",
      heading:
        "font-serif text-3xl font-semibold leading-tight tracking-tight lg:text-4xl",
      articleH1:
        "font-serif scroll-m-20 text-4xl font-semibold leading-tight tracking-tight lg:text-5xl",
      articleHeading1:
        "font-serif scroll-m-20 text-4xl font-semibold leading-tight tracking-tight lg:text-5xl",
      articleH2:
        "font-serif scroll-m-20 text-3xl font-semibold leading-tight tracking-tight lg:text-4xl",
      articleHeading2:
        "font-serif scroll-m-20 text-3xl font-semibold leading-tight tracking-tight lg:text-4xl",
      articleH3:
        "font-serif scroll-m-20 text-2xl font-semibold leading-tight tracking-tight lg:text-3xl",
      articleHeading3:
        "font-serif scroll-m-20 text-2xl font-semibold leading-tight tracking-tight lg:text-3xl",
      articleH4:
        "font-serif scroll-m-20 text-xl font-semibold leading-tight tracking-tight lg:text-2xl",
      articleHeading4:
        "font-serif scroll-m-20 text-xl font-semibold leading-tight tracking-tight lg:text-2xl",
      articleLead: "font-serif text-xl leading-relaxed text-muted-foreground",
      articleDeck: "font-serif text-xl leading-relaxed text-muted-foreground",
      deck: "font-serif text-xl leading-relaxed text-muted-foreground",
      articleBody: "font-serif text-lg leading-8",
      articleProse: "font-serif text-lg leading-8",
      prose: "font-serif text-lg leading-8",
      articleBlockquote:
        "font-serif border-y border-foreground py-8 text-2xl font-medium leading-tight tracking-tight lg:text-3xl",
      pullQuote:
        "font-serif border-y border-foreground py-8 text-2xl font-medium leading-tight tracking-tight lg:text-3xl",
      pullquote:
        "font-serif border-y border-foreground py-8 text-2xl font-medium leading-tight tracking-tight lg:text-3xl",
      articleCaption: "font-serif text-sm leading-normal text-muted-foreground",
      articleByline: "font-serif text-sm leading-normal text-muted-foreground",
      articleMeta: "font-serif text-xs leading-normal text-muted-foreground",
      articleCode: "font-mono text-sm leading-relaxed",
      code: "font-mono text-sm leading-relaxed",
      codeLabel: "font-mono text-xs font-medium tracking-wide",
      caption: "text-xs leading-normal text-muted-foreground",
      byline: "text-sm leading-normal text-muted-foreground",
      meta: "text-xs leading-normal text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "p",
  },
});

type TypographyVariant = NonNullable<VariantProps<typeof typographyVariants>["variant"]>;

type TypographyProps = React.HTMLAttributes<HTMLElement> & {
  /** Render a semantic element other than the variant's default element. */
  as?: React.ElementType;
  variant?: TypographyVariant;
};

const defaultElements: Record<TypographyVariant, React.ElementType> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  p: "p",
  body: "p",
  lead: "p",
  large: "div",
  small: "small",
  muted: "p",
  blockquote: "blockquote",
  list: "ul",
  inlineCode: "code",
  articleDisplay: "h1",
  display: "h1",
  articleTitle: "h1",
  title: "h1",
  heading: "h2",
  articleH1: "h1",
  articleHeading1: "h1",
  articleH2: "h2",
  articleHeading2: "h2",
  articleH3: "h3",
  articleHeading3: "h3",
  articleH4: "h4",
  articleHeading4: "h4",
  articleLead: "p",
  articleDeck: "p",
  deck: "p",
  articleBody: "p",
  articleProse: "p",
  prose: "p",
  articleBlockquote: "blockquote",
  pullQuote: "blockquote",
  pullquote: "blockquote",
  articleCaption: "p",
  articleByline: "p",
  articleMeta: "p",
  articleCode: "code",
  code: "code",
  codeLabel: "span",
  caption: "small",
  byline: "small",
  meta: "small",
};

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ as, className, variant = "p", ...props }, ref) => {
    const Component = as ?? defaultElements[variant];

    return (
      <Component
        ref={ref}
        className={cn(typographyVariants({ variant }), className)}
        {...props}
      />
    );
  },
);
Typography.displayName = "Typography";

export { Typography, typographyVariants };
export type { TypographyProps, TypographyVariant };
