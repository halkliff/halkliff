"use client";

import * as React from "react";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

/** Displays a textual keyboard key in the same composable shape as shadcn/ui. */
const Kbd = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <kbd
      ref={ref}
      className={cn(
        "pointer-events-none inline-flex h-5 select-none items-center justify-center gap-1 rounded-sm border border-border bg-[var(--surface-muted)] px-1.5 font-mono text-[10px] font-medium text-[var(--ink)]",
        className,
      )}
      {...props}
    />
  ),
);
Kbd.displayName = "Kbd";

/** Groups adjacent keys, for example Ctrl + K, as one keyboard shortcut. */
const KbdGroup = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  ),
);
KbdGroup.displayName = "KbdGroup";

type KeyboardPlatform = "apple" | "standard";

export function detectKeyboardPlatform(platformDescription: string): KeyboardPlatform {
  return /Mac|iPhone|iPad|iPod/i.test(platformDescription)
    ? "apple"
    : "standard";
}

const subscribeToPlatform = () => () => {};
const getServerPlatform = (): KeyboardPlatform => "standard";
const getClientPlatform = (): KeyboardPlatform => {
  const platform = `${navigator.platform ?? ""} ${navigator.userAgent ?? ""}`;
  return detectKeyboardPlatform(platform);
};

/** Resolve the user's modifier key without causing a server/client mismatch. */
export function useKeyboardPlatform(): KeyboardPlatform {
  return useSyncExternalStore(
    subscribeToPlatform,
    getClientPlatform,
    getServerPlatform,
  );
}

export interface KbdShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** The key rendered after the platform modifier, e.g. `K` or `↵`. */
  keyLabel: string;
  /** The label used for Apple platforms. */
  appleLabel?: string;
  /** The label used for Windows/Linux/other platforms. */
  standardLabel?: string;
  /** Optional styling shared by both rendered key caps. */
  keyClassName?: string;
}

/** A reusable platform-aware shortcut, such as ⌘ K on macOS or Ctrl K elsewhere. */
export function KbdShortcut({
  appleLabel = "⌘",
  className,
  keyClassName,
  keyLabel,
  standardLabel = "Ctrl",
  ...props
}: KbdShortcutProps) {
  const platform = useKeyboardPlatform();
  return (
    <KbdGroup className={className} {...props}>
      <Kbd className={keyClassName}>
        {platform === "apple" ? appleLabel : standardLabel}
      </Kbd>
      <Kbd className={keyClassName}>{keyLabel}</Kbd>
    </KbdGroup>
  );
}

export { Kbd, KbdGroup };
