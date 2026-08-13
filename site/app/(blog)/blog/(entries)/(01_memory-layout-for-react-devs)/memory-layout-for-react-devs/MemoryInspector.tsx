"use client";

import { useMemo, useState } from "react";
import { cva } from "class-variance-authority";
import { Badge } from "@/app/components/ui/badge";
import { Card } from "@/app/components/ui/card";
import { Typography } from "@/app/components/ui/typography";
import { SegmentedControl } from "@/app/components/site/SegmentedControl";
import { cn } from "@/lib/utils";
import {
  createMemoryModel,
  MEMORY_ELEMENT_TYPES,
  type MemoryElementType,
} from "./memory-model";

const memoryCellVariants = cva(
  "relative flex aspect-[0.8] min-w-[34px] flex-col items-center justify-center border border-border",
  {
    variants: {
      groupStart: {
        false: "",
        true: "border-l-[var(--acid)]",
      },
      tone: {
        mint: "bg-[color-mix(in_srgb,var(--mint)_16%,var(--card))]",
        orange: "bg-[color-mix(in_srgb,var(--orange)_16%,var(--card))]",
        violet: "bg-[color-mix(in_srgb,var(--violet)_16%,var(--card))]",
      },
    },
  },
);

export function MemoryInspector() {
  const [kind, setKind] = useState<MemoryElementType>("u16");
  const [length, setLength] = useState(4);
  const config = MEMORY_ELEMENT_TYPES[kind];
  const model = useMemo(() => createMemoryModel(kind, length), [kind, length]);
  const { cells, elementBytes, endAddress, startAddress, totalBytes } = model;

  return (
    <figure className="my-12 w-full max-w-full min-w-0">
      <Card
        className="w-full max-w-full min-w-0 gap-0 rounded-none p-7 shadow-sm max-md:p-5"
        data-visualization="memory-inspector"
      >
        <div className="grid grid-cols-2 items-end gap-9 max-sm:grid-cols-1 max-sm:gap-5">
          <div>
            <Typography
              as="span"
              className="mb-2.5 block text-[9px] tracking-[0.11em]"
              variant="codeLabel"
            >
              ELEMENT TYPE
            </Typography>
            <SegmentedControl
              ariaLabel="Memory element type"
              onChange={setKind}
              options={(Object.keys(MEMORY_ELEMENT_TYPES) as MemoryElementType[]).map((type) => ({
                value: type,
                label: type,
              }))}
              value={kind}
            />
          </div>
          <label className="block">
            <Typography
              as="span"
              className="mb-2.5 block text-[9px] tracking-[0.11em]"
              variant="codeLabel"
            >
              ARRAY LENGTH
            </Typography>
            <div className="grid grid-cols-[minmax(0,1fr)_30px] items-center gap-4">
              <input
                aria-label="Array length"
                className="w-full accent-[var(--acid)]"
                type="range"
                min="2"
                max="8"
                value={length}
                onChange={(event) => setLength(Number(event.target.value))}
              />
              <output className="text-[var(--acid)]">
                <Typography as="span" className="text-[11px]" variant="codeLabel">
                  {length}
                </Typography>
              </output>
            </div>
          </label>
        </div>

        <div className="my-7 grid grid-cols-4 border-y border-border py-4 max-md:grid-cols-2">
          <div className="border-l border-border px-3.5 first:border-l-0 first:pl-0 max-md:border-b max-md:py-3">
            <Typography
              as="span"
              className="mb-2 block text-[8px] tracking-[0.08em]"
              variant="codeLabel"
            >
              TYPE
            </Typography>
            <Typography as="strong" className="block text-[10px]" variant="articleCode">
              [{kind}; {length}]
            </Typography>
          </div>
          <div className="border-l border-border px-3.5 max-md:border-b max-md:py-3">
            <Typography
              as="span"
              className="mb-2 block text-[8px] tracking-[0.08em]"
              variant="codeLabel"
            >
              ELEMENT SIZE
            </Typography>
            <Typography as="strong" className="block text-[10px]" variant="articleCode">
              {elementBytes} byte{elementBytes > 1 ? "s" : ""}
            </Typography>
          </div>
          <div className="border-l border-border px-3.5 max-md:border-b max-md:border-l-0 max-md:py-3 max-md:pl-0">
            <Typography
              as="span"
              className="mb-2 block text-[8px] tracking-[0.08em]"
              variant="codeLabel"
            >
              TOTAL SIZE
            </Typography>
            <Typography as="strong" className="block text-[10px]" variant="articleCode">
              {totalBytes} bytes
            </Typography>
          </div>
          <div className="border-l border-border px-3.5 max-md:border-b max-md:py-3">
            <Typography
              as="span"
              className="mb-2 block text-[8px] tracking-[0.08em]"
              variant="codeLabel"
            >
              ADDRESS RANGE
            </Typography>
            <Typography as="strong" className="block text-[10px]" variant="articleCode">
              0x{startAddress.toString(16).toUpperCase()}—0x
              {endAddress.toString(16).toUpperCase()}
            </Typography>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto">
          <div
            className="grid min-w-[560px] gap-1"
            style={{
              gridTemplateColumns: `repeat(${Math.min(totalBytes, 16)}, minmax(0, 1fr))`,
            }}
          >
            {cells.map((cell, index) => (
              <div
                className={cn(
                  memoryCellVariants({
                  groupStart: index % elementBytes === 0,
                    tone: config.color,
                  }),
                )}
                key={cell.address}
                title={`Element ${cell.group}, address 0x${cell.address.toString(16).toUpperCase()}`}
              >
                <Typography as="span" className="text-[9px]" variant="articleCode">
                  {cell.value}
                </Typography>
                <Typography
                  as="small"
                  className="absolute bottom-[3px] text-[7px] text-muted-foreground"
                  variant="codeLabel"
                >
                  +{index}
                </Typography>
              </div>
            ))}
          </div>
        </div>

        <Typography
          as="figcaption"
          className="mt-5 text-muted-foreground"
          variant="caption"
        >
          <Badge
            className="mr-2 rounded-none border-[var(--acid)] bg-[var(--acid)] px-1.5 py-1 text-[var(--accent-contrast)]"
            variant="outline"
          >
            <Typography as="span" className="text-[8px] tracking-[0.12em]" variant="codeLabel">
              INTERACTIVE
            </Typography>
          </Badge>
          A <Typography as="code" className="mx-0.5" variant="inlineCode">{kind}</Typography> consumes {elementBytes} contiguous byte
          {elementBytes > 1 ? "s" : ""}. This array has {length} elements, so
          its payload occupies exactly <Typography as="strong" className="text-inherit" variant="articleCode">{totalBytes} bytes</Typography> before
          any container metadata.
        </Typography>
      </Card>
    </figure>
  );
}
