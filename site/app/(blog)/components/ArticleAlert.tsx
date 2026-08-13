import type { ReactNode } from "react";
import { CircleAlert, Info, Lightbulb, NotebookPen, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert";
import { Typography } from "@/app/components/ui/typography";
import { cn } from "@/lib/utils";

export type ArticleAlertVariant = "note" | "tip" | "info" | "caution" | "danger";

const icons = {
  note: NotebookPen,
  tip: Lightbulb,
  info: Info,
  caution: TriangleAlert,
  danger: CircleAlert,
} satisfies Record<ArticleAlertVariant, typeof Info>;

const defaultTitles = {
  note: "Note",
  tip: "Tip",
  info: "Info",
  caution: "Caution",
  danger: "Danger",
} satisfies Record<ArticleAlertVariant, string>;

interface ArticleAlertProps {
  children: ReactNode;
  className?: string;
  title?: string;
  variant?: ArticleAlertVariant;
}

/** GitHub-style editorial alerts composed from the shared shadcn primitive. */
export function ArticleAlert({
  children,
  className,
  title,
  variant = "note",
}: ArticleAlertProps) {
  const Icon = icons[variant];

  return (
    <Alert
      className={cn("my-11 font-[family-name:var(--font-sans)]", className)}
      variant={variant}
    >
      <Icon aria-hidden="true" />
      <AlertTitle>
        <Typography as="span" variant="codeLabel">
          {title ?? defaultTitles[variant]}
        </Typography>
      </AlertTitle>
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}
