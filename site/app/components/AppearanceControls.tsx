"use client";

import { useSyncExternalStore } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { SegmentedControl } from "./site/SegmentedControl";
import { Typography } from "./ui/typography";

type Theme = "system" | "light" | "dark";

const subscribeToHydration = () => () => {};
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

const appearanceVariants = cva(
  "theme-switch flex w-max items-center rounded-none border p-0.5 [&>button]:h-8 [&>button]:cursor-pointer [&>button]:rounded-md [&>button]:border-0 [&>button]:bg-transparent [&>button]:px-3 [&>button]:py-0 [&>button]:font-[family-name:var(--font-mono)] [&>button]:text-[9px] [&>button]:font-normal [&>button]:tracking-[0.04em] [&>button]:uppercase",
  {
    variants: {
      surface: {
        default:
          "border-[var(--line)] [&>button]:text-[var(--muted)] [&>button]:hover:bg-[var(--accent)] [&>button]:hover:text-[var(--ink)] [&>button.active]:bg-[var(--ink)] [&>button.active]:text-[var(--paper)]",
        inverse:
          "border-[var(--dark-line)] [&>button]:text-[#9ca7aa] [&>button]:hover:bg-white/[0.06] [&>button]:hover:text-[var(--dark-fg)] [&>button.active]:bg-[var(--dark-fg)] [&>button.active]:text-[var(--dark-bg)]",
      },
    },
    defaultVariants: {
      surface: "default",
    },
  },
);

type AppearanceControlsProps = VariantProps<typeof appearanceVariants> & {
  className?: string;
  label?: string;
  labelClassName?: string;
  placement?: "standalone" | "header" | "footer";
};

/** The single site-wide light, dark, and system appearance selector. */
export function AppearanceControls({
  className,
  label: labelOverride,
  labelClassName,
  placement = "standalone",
  surface = "default",
}: AppearanceControlsProps) {
  const { setTheme, theme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );

  const selectedTheme: Theme =
    mounted && (theme === "light" || theme === "dark" || theme === "system")
      ? theme
      : "system";
  const label =
    labelOverride ?? (placement === "standalone" ? undefined : "Appearance");
  const resolvedSurface = placement === "footer" ? "inverse" : surface;

  const control = (
    <SegmentedControl
      ariaLabel="Color theme"
      className={appearanceVariants({ surface: resolvedSurface })}
      onChange={setTheme}
      options={(["system", "light", "dark"] as Theme[]).map((option) => ({
        value: option,
        label: option,
      }))}
      value={selectedTheme}
    />
  );

  if (!label) return className ? <div className={className}>{control}</div> : control;

  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <Typography
        as="span"
        className={cn(
          "text-[8px] tracking-widest text-muted uppercase",
          labelClassName,
        )}
        variant="codeLabel"
      >
        {label}
      </Typography>
      {control}
    </div>
  );
}
