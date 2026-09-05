"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Typography } from "./ui/typography";

const email = "halkliff@pm.me";

export function ContactCta() {
  const [status, setStatus] = useState("");

  async function revealContact() {
    setStatus(`Email: ${email}`);
    try {
      await navigator.clipboard?.writeText(email);
      setStatus(`Copied ${email} — paste it anywhere.`);
    } catch {
      // The visible address is the fallback when clipboard access is unavailable.
    }
  }

  return (
    <div>
      <a
        className="inline-block"
        href={`mailto:${email}`}
        onClick={revealContact}
      >
        <Typography
          as="span"
          className="text-[clamp(38px,6vw,88px)] font-[520] leading-[1.02] tracking-[-0.065em]"
          variant="h1"
        >
          <span className="inline-flex items-baseline gap-[0.12em]">
          Let&apos;s make it boringly clear.
          <ArrowUpRight aria-hidden="true" className="inline size-[0.72em] shrink-0" strokeWidth={1.7} />
          </span>
        </Typography>
      </a>
      <Typography
        as="p"
        aria-live="polite"
        className="!mt-4 min-h-[1.5em] text-[9px] text-[var(--acid)]"
        variant="caption"
      >
        {status}
      </Typography>
    </div>
  );
}
