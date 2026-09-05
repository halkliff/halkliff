import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Typography } from "../ui/typography";

type SectionKickerProps = {
  left: ReactNode;
  right?: ReactNode;
  className?: string;
};

/** The small two-sided label shared by the long-form portfolio sections. */
export function SectionKicker({ left, right, className }: SectionKickerProps) {
  return (
    <div
      className={cn(
        "section-kicker mx-auto mb-6 flex max-w-[1380px] justify-between font-[family-name:var(--font-mono)] text-[9px] tracking-[0.12em]",
        className,
      )}
    >
      <Typography as="span" className="text-[9px]" variant="codeLabel">
        {left}
      </Typography>
      {right ? (
        <Typography as="span" className="text-[9px]" variant="codeLabel">
          {right}
        </Typography>
      ) : null}
    </div>
  );
}
