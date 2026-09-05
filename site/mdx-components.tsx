import type { ComponentProps } from "react";
import type { MDXComponents } from "mdx/types";
import { ArticleAlert } from "@/app/(blog)/components/ArticleAlert";
import { ArticleHeading } from "@/app/(blog)/components/ArticleHeading";
import { StaticCodeBlock } from "@/app/(blog)/components/StaticCodeBlock";
import { CodeNotebook } from "@/app/components/code-notebook";
import { Kbd } from "@/app/components/ui/kbd";
import { Typography } from "@/app/components/ui/typography";

type MarkdownCodeProps = ComponentProps<"code"> & {
  "data-code-block"?: string;
};

function MarkdownCode({
  className,
  "data-code-block": dataCodeBlock,
  ...props
}: MarkdownCodeProps) {
  if (dataCodeBlock) {
    return (
      <code className={className} data-code-block={dataCodeBlock} {...props} />
    );
  }

  return <Typography as="code" variant="inlineCode" className={className} {...props} />;
}

const markdownComponents: MDXComponents = {
  p: (props: ComponentProps<"p">) => (
    <Typography as="p" variant="articleBody" {...props} />
  ),
  h1: (props: ComponentProps<"h1">) => (
    <Typography as="h1" variant="h1" {...props} />
  ),
  h2: (props: ComponentProps<"h2">) => (
    <Typography as="h2" variant="h2" {...props} />
  ),
  h3: (props: ComponentProps<"h3">) => (
    <Typography as="h3" variant="h3" {...props} />
  ),
  h4: (props: ComponentProps<"h4">) => (
    <Typography as="h4" variant="h4" {...props} />
  ),
  blockquote: (props: ComponentProps<"blockquote">) => (
    <Typography as="blockquote" variant="blockquote" {...props} />
  ),
  ul: (props: ComponentProps<"ul">) => (
    <Typography
      as="ul"
      className="my-6 ml-6 list-disc [&>li]:mt-2"
      variant="articleBody"
      {...props}
    />
  ),
  pre: StaticCodeBlock,
  code: MarkdownCode,
  kbd: Kbd,
  ArticleAlert,
  ArticleHeading,
  CodeNotebook,
  Typography,
  Kbd,
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...markdownComponents, ...components };
}
