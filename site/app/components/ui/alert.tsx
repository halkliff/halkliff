import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 rounded-none border px-5 py-3.5 text-sm [&>svg]:size-4",
  {
    variants: {
      variant: {
        info: "border-info/60 bg-info/10 text-card-foreground [&>svg]:text-info",
        note: "border-border bg-muted/60 text-card-foreground [&>svg]:text-muted-foreground",
        tip: "border-success/60 bg-success/10 text-card-foreground [&>svg]:text-success",
        caution: "border-warning/60 bg-warning/10 text-card-foreground [&>svg]:text-warning",
        danger: "border-destructive/60 bg-destructive/10 text-card-foreground [&>svg]:text-destructive",
      },
    },
    defaultVariants: { variant: "note" },
  },
);

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      className={cn(alertVariants({ variant }), className)}
      data-slot="alert"
      ref={ref}
      role="alert"
      {...props}
    />
  ),
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      className={cn("col-start-2 font-mono text-[10px] font-semibold tracking-[0.11em] uppercase", className)}
      data-slot="alert-title"
      ref={ref}
      {...props}
    />
  ),
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      className={cn("col-start-2 mt-1 text-sm leading-relaxed [&_p]:m-0!", className)}
      data-slot="alert-description"
      ref={ref}
      {...props}
    />
  ),
);
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription, AlertTitle, alertVariants };
