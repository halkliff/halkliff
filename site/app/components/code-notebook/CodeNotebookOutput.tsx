"use client";

import { useState } from "react";
import { cva } from "class-variance-authority";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Typography } from "@/app/components/ui/typography";
import { cn } from "@/lib/utils";

const outputTabVariants = cva(
  "inline-flex min-w-0 w-full items-center justify-between gap-2.5 rounded-none border px-2.5 py-2 text-left font-[family-name:var(--font-code)] uppercase transition-colors hover:border-ring hover:text-foreground",
  {
    variants: {
      active: {
        false: "border-border bg-transparent text-muted-foreground",
        true: "border-foreground bg-muted text-foreground",
      },
      hasError: {
        false: "",
        true: "border-[color-mix(in_srgb,var(--orange)_55%,var(--border))]!",
      },
    },
  },
);

const outputValueVariants = cva(
  "m-0! min-h-[184px]! w-full! max-w-full! overflow-auto! whitespace-pre-wrap! break-words! rounded-none! border! bg-[var(--background)]! p-4! font-[family-name:var(--font-code)]! text-[13px]! leading-[1.7]!",
  {
    variants: {
      error: {
        false: "border-border! text-[var(--foreground)]!",
        true: "border-[color-mix(in_srgb,var(--orange)_55%,var(--border))]! text-[var(--orange)]!",
      },
    },
  },
);

export interface CodeNotebookOutputProps {
  stderr: string;
  stdout: string;
  className?: string;
}

export function CodeNotebookOutput({
  stderr,
  stdout,
  className,
}: CodeNotebookOutputProps) {
  const [selectedStream, setSelectedStream] = useState<"stdout" | "stderr">();
  const activeStream = selectedStream ?? (stderr && !stdout ? "stderr" : "stdout");

  const streams = {
    stdout: {
      label: "STDOUT",
      value: stdout,
      emptyLabel: "No stdout yet.",
    },
    stderr: {
      label: "STDERR",
      value: stderr,
      emptyLabel: "No stderr yet.",
    },
  } as const;
  const stream = streams[activeStream];

  return (
    <section
      aria-label="Notebook output"
      className={cn("border-t border-border p-4", className)}
    >
      <div
        aria-label="Output streams"
        className="mb-2.5 grid min-w-0 grid-cols-2 gap-1.5"
        role="tablist"
      >
        {(Object.keys(streams) as Array<keyof typeof streams>).map((key) => {
          const item = streams[key];
          const selected = activeStream === key;
          return (
            <Button
              aria-controls={`notebook-output-${key}`}
              aria-selected={selected}
              className={outputTabVariants({
                active: selected,
                hasError: key === "stderr" && Boolean(item.value),
              })}
              id={`notebook-output-tab-${key}`}
              key={key}
              onClick={() => setSelectedStream(key)}
              role="tab"
              size="sm"
              type="button"
              variant="unstyled"
            >
              <Typography as="span" className="truncate" variant="small">
                {item.label}
              </Typography>
              <Badge
                className="rounded-none border-border px-1.5 py-0 text-[10px] normal-case tracking-[0.02em]"
                variant="outline"
              >
                <Typography as="span" className="text-[10px] normal-case tracking-[0.02em]" variant="codeLabel">
                  {item.value ? "received" : "empty"}
                </Typography>
              </Badge>
            </Button>
          );
        })}
      </div>
      <div
        aria-labelledby={`notebook-output-tab-${activeStream}`}
        className="min-h-[184px] min-w-0"
        id={`notebook-output-${activeStream}`}
        role="tabpanel"
        tabIndex={0}
      >
        <pre className={outputValueVariants({ error: activeStream === "stderr" && Boolean(stream.value) })}>
          {stream.value || (
            <Typography as="span" className="text-muted-foreground" variant="articleCode">
              {stream.emptyLabel}
            </Typography>
          )}
        </pre>
      </div>
    </section>
  );
}
