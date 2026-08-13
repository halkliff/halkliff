"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Link as LinkIcon } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Typography } from "@/app/components/ui/typography";

export interface ArticleHeadingProps {
  children: ReactNode;
  id: string;
  index: `${number}`;
}

/** Required IDs make every article section addressable and safely copyable. */
export function ArticleHeading({ children, id, index }: ArticleHeadingProps) {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current);
    },
    [],
  );

  async function copyDeepLink() {
    const url = new URL(window.location.href);
    url.hash = id;
    await navigator.clipboard.writeText(url.toString());
    window.history.replaceState(window.history.state, "", url);
    setCopied(true);
    if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current);
    resetTimerRef.current = window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <Typography
      as="h2"
      className="group mt-16 mb-6 flex scroll-mt-28 items-baseline gap-4 text-[clamp(32px,4vw,48px)] font-[560] leading-[1.05] tracking-[-0.045em]"
      id={id}
      variant="articleH2"
    >
      <Typography as="span" className="text-[9px] tracking-normal text-muted-foreground" variant="codeLabel">
        {index}
      </Typography>
      <a className="min-w-0 flex-1 no-underline" href={`#${id}`}>
        <Typography as="span" variant="articleH2">
          {children}
        </Typography>
      </a>
      <Button
        aria-label={copied ? `Copied link to ${id}` : `Copy link to ${id}`}
        className="size-8 shrink-0 rounded-none opacity-45 transition-opacity hover:bg-muted group-hover:opacity-100"
        onClick={() => {
          void copyDeepLink().catch(() => {
            window.location.hash = id;
          });
        }}
        size="icon"
        title={copied ? "Link copied" : "Copy section link"}
        type="button"
        variant="ghost"
      >
        {copied ? <Check aria-hidden="true" className="size-4" /> : <LinkIcon aria-hidden="true" className="size-4" />}
      </Button>
    </Typography>
  );
}
