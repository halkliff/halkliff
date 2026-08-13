import { Badge } from "@/app/components/ui/badge";
import { Card } from "@/app/components/ui/card";
import { Typography } from "@/app/components/ui/typography";
import { cn } from "@/lib/utils";

export function AlignmentDiagram() {
  return (
    <Card
      aria-label="Struct alignment example"
      className="my-10 w-full min-w-0 max-w-full gap-0 rounded-none p-6 shadow-sm"
      data-visualization="alignment-diagram"
      role="img"
    >
      <div className="mb-[18px] flex items-center justify-between gap-4">
        <Typography as="span" variant="codeLabel">
          struct Before
        </Typography>
        <Typography as="small" className="text-muted-foreground" variant="codeLabel">
          12 BYTES
        </Typography>
      </div>

      <div className="max-w-full overflow-x-auto">
        <div className="grid min-w-[580px] grid-cols-[repeat(12,minmax(0,1fr))] gap-[3px]">
          <span className="flex aspect-square items-center justify-center border border-border bg-[var(--mint)] font-[family-name:var(--font-code)] text-[10px] text-[var(--accent-contrast)] dark:bg-[color-mix(in_srgb,var(--mint)_32%,var(--card))] dark:text-foreground">
            A
          </span>
          {Array.from({ length: 3 }, (_, index) => (
            <span
              className={cn(
                "flex aspect-square items-center justify-center border border-border font-[family-name:var(--font-code)] text-[10px] text-muted-foreground",
                "bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,color-mix(in_srgb,var(--border)_32%,transparent)_4px,color-mix(in_srgb,var(--border)_32%,transparent)_5px)]",
              )}
              key={`pad-before-${index}`}
            >
              ·
            </span>
          ))}
          {Array.from({ length: 4 }, (_, index) => (
            <span
              className="flex aspect-square items-center justify-center border border-border bg-[var(--violet)] font-[family-name:var(--font-code)] text-[10px] text-[var(--accent-contrast)] dark:bg-[color-mix(in_srgb,var(--violet)_42%,var(--card))] dark:text-foreground"
              key={`byte-b-${index}`}
            >
              B
            </span>
          ))}
          <span className="flex aspect-square items-center justify-center border border-border bg-[var(--orange)] font-[family-name:var(--font-code)] text-[10px] text-[var(--accent-contrast)] dark:bg-[color-mix(in_srgb,var(--orange)_42%,var(--card))] dark:text-foreground">
            C
          </span>
          {Array.from({ length: 3 }, (_, index) => (
            <span
              className="flex aspect-square items-center justify-center border border-border bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,color-mix(in_srgb,var(--border)_32%,transparent)_4px,color-mix(in_srgb,var(--border)_32%,transparent)_5px)] font-[family-name:var(--font-code)] text-[10px] text-muted-foreground"
              key={`pad-after-${index}`}
            >
              ·
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4">
        <Badge className="rounded-none border-0 bg-transparent p-0 text-muted-foreground" variant="outline">
          <span aria-hidden="true" className="block size-2 bg-[var(--mint)] dark:bg-[color-mix(in_srgb,var(--mint)_32%,var(--card))]" />
          <Typography as="span" variant="codeLabel">data</Typography>
        </Badge>
        <Badge className="rounded-none border-0 bg-transparent p-0 text-muted-foreground" variant="outline">
          <span aria-hidden="true" className="block size-2 border border-dashed border-border" />
          <Typography as="span" variant="codeLabel">padding</Typography>
        </Badge>
      </div>
    </Card>
  );
}
