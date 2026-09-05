"use client";

import { cva } from "class-variance-authority";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { ButtonGroup } from "../ui/button-group";
import { Typography } from "../ui/typography";

export type SegmentedOption<Value extends string> = {
  value: Value;
  label: ReactNode;
};

type SegmentedControlProps<Value extends string> = {
  ariaLabel: string;
  className?: string;
  onChange: (value: Value) => void;
  options: readonly SegmentedOption<Value>[];
  value: Value;
};

const segmentedOptionVariants = cva(
  "border-0 bg-transparent font-[family-name:var(--font-mono)] text-[10px] font-normal text-[#8f958b] transition-colors hover:bg-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--acid)] focus-visible:ring-offset-0",
  {
    variants: {
      active: {
        false: "",
        true: "active bg-[var(--acid)] text-[var(--ink)]",
      },
    },
  },
);

/** A small controlled segmented control shared by preference and article labs. */
export function SegmentedControl<Value extends string>({
  ariaLabel,
  className,
  onChange,
  options,
  value,
}: SegmentedControlProps<Value>) {
  return (
    <ButtonGroup
      aria-label={ariaLabel}
      className={cn(
        "flex w-max border border-[var(--dark-line)]",
        className,
      )}
      role="group"
    >
      {options.map((option) => (
        <Button
          aria-pressed={value === option.value}
          className={segmentedOptionVariants({
            active: value === option.value,
          })}
          key={option.value}
          onClick={() => onChange(option.value)}
          type="button"
          variant="unstyled"
        >
          <Typography
            as="span"
            className="text-[inherit] leading-none"
            variant="codeLabel"
          >
            {option.label}
          </Typography>
        </Button>
      ))}
    </ButtonGroup>
  );
}
