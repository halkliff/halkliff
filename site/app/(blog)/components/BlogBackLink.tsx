"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { usePreviousPath } from "@/app/components/navigation-history";
import { Typography } from "@/app/components/ui/typography";
import { cn } from "@/lib/utils";

interface BlogBackLinkProps {
  className?: string;
  variant?: "inline" | "action";
}

export function BlogBackLink({ className, variant = "inline" }: BlogBackLinkProps) {
  const previousPath = usePreviousPath();
  const router = useRouter();
  const cameFromWorkbench = previousPath === "/";
  const href = cameFromWorkbench ? "/#workbench" : "/blog";
  const label = cameFromWorkbench ? "Back to the workbench" : "Back to field notes";

  return (
    <Link
      className={cn(
        "article-back inline-flex items-center gap-1.5 hover:text-[var(--acid)]",
        variant === "action" &&
          "h-10 w-fit border border-current px-3.5 transition-colors hover:border-[var(--acid)]",
        className,
      )}
      href={href}
      onClick={(event) => {
        const canReturnToPreviousPage =
          (cameFromWorkbench || previousPath === "/blog") &&
          window.history.length > 1;

        if (!canReturnToPreviousPage) return;

        event.preventDefault();
        router.back();
      }}
    >
      <ArrowLeft aria-hidden="true" className="size-3" />
      <Typography as="span" className="text-[9px] tracking-[0.07em] uppercase" variant="codeLabel">
        {label}
      </Typography>
    </Link>
  );
}
