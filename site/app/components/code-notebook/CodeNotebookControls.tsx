import { Button } from "@/app/components/ui/button";
import { KbdShortcut } from "@/app/components/ui/kbd";
import { Typography } from "@/app/components/ui/typography";
import { cn } from "@/lib/utils";
import { Check, Copy, Play, RotateCcw, Square } from "lucide-react";
import type { NotebookStatus } from "./types";

export interface CodeNotebookControlsProps {
  copied: boolean;
  onCopy: () => void;
  onReset: () => void;
  onRun: () => void;
  onStop: () => void;
  status: NotebookStatus;
  className?: string;
}

export function CodeNotebookControls({
  copied,
  onCopy,
  onReset,
  onRun,
  onStop,
  status,
  className,
}: CodeNotebookControlsProps) {
  const busy = status === "loading" || status === "running";
  const canRun = ["ready", "complete", "stopped", "error"].includes(status);

  return (
    <div
      aria-label="Notebook controls"
      className={cn(
        "flex min-w-0 flex-wrap items-center gap-2 border-b border-border px-4 py-3",
        className,
      )}
      role="toolbar"
    >
      {busy ? (
        <Button onClick={onStop} size="sm" variant="destructive">
          <Square aria-hidden="true" className="size-3.5" />
          <Typography as="span" variant="small">Stop</Typography>
        </Button>
      ) : (
        <Button disabled={!canRun} onClick={onRun} size="sm">
          <Play aria-hidden="true" className="size-3.5" />
          <Typography as="span" variant="small">
            {status === "idle" ? "Preparing…" : "Run"}
          </Typography>
        </Button>
      )}
      <Button onClick={onReset} size="sm" variant="outline">
        <RotateCcw aria-hidden="true" className="size-3.5" />
        <Typography as="span" variant="small">Reset</Typography>
      </Button>
      <Button onClick={onCopy} size="sm" variant="ghost">
        {copied ? (
          <Check aria-hidden="true" className="size-3.5" />
        ) : (
          <Copy aria-hidden="true" className="size-3.5" />
        )}
        <Typography as="span" variant="small">
          {copied ? "Copied" : "Copy"}
        </Typography>
      </Button>
      <Typography
        as="span"
        className="ml-auto inline-flex items-center gap-2 text-xs text-muted-foreground max-sm:ml-0"
        variant="codeLabel"
      >
        <Typography as="span" className="hidden sm:inline" variant="codeLabel">run</Typography>
        <KbdShortcut aria-label="Run notebook shortcut" keyLabel="↵" />
      </Typography>
    </div>
  );
}
