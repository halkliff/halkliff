import type { ComponentProps } from "react";
import { Card } from "@/app/components/ui/card";
import { cn } from "@/lib/utils";

interface StaticCodeBlockProps extends ComponentProps<"pre"> {
  showLineNumbers?: boolean;
}

/** Server-rendered Shiki output framed with the same surface as live notebooks. */
export function StaticCodeBlock({
  className,
  showLineNumbers = true,
  ...props
}: StaticCodeBlockProps) {
  return (
    <Card className="my-10 min-w-0 w-full max-w-full gap-0 rounded-none p-0 shadow-sm">
      <pre
        className={cn(
          "m-0! w-full max-w-full overflow-x-auto rounded-none! border-0! bg-[var(--syntax-surface)]! p-[18px_20px]! font-[family-name:var(--font-code)]! text-[13px]! leading-[1.7]! whitespace-pre!",
          showLineNumbers &&
            "[counter-reset:line] [&_.line]:before:mr-4 [&_.line]:before:inline-block [&_.line]:before:w-6 [&_.line]:before:[counter-increment:line] [&_.line]:before:content-[counter(line)] [&_.line]:before:text-right [&_.line]:before:text-[10px] [&_.line]:before:text-muted-foreground",
          className,
        )}
        data-line-numbers={showLineNumbers || undefined}
        {...props}
      />
    </Card>
  );
}
