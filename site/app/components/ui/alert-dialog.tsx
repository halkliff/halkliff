"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type AlertDialogContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const AlertDialogContext = React.createContext<AlertDialogContextValue | null>(
  null,
);

function useAlertDialogContext(component: string) {
  const context = React.useContext(AlertDialogContext);

  if (!context) {
    throw new Error(`${component} must be used inside AlertDialog`);
  }

  return context;
}

export interface AlertDialogProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AlertDialog({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
}: AlertDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) setUncontrolledOpen(nextOpen);
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange],
  );

  return (
    <AlertDialogContext.Provider value={{ open: Boolean(open), setOpen }}>
      {children}
    </AlertDialogContext.Provider>
  );
}

export interface AlertDialogTriggerProps
  extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean;
  children: React.ReactElement;
}

export function AlertDialogTrigger({
  asChild = false,
  children,
  onClick,
  ...props
}: AlertDialogTriggerProps) {
  const { open, setOpen } = useAlertDialogContext("AlertDialogTrigger");
  const childOnClick = React.isValidElement<{ onClick?: React.MouseEventHandler<HTMLElement> }>(children)
    ? children.props.onClick
    : undefined;
  const triggerProps = {
    ...props,
    "aria-expanded": open,
    "aria-haspopup": "dialog" as const,
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      childOnClick?.(event);
      onClick?.(event);
      if (!event.defaultPrevented) setOpen(!open);
    },
  };

  if (asChild) return React.cloneElement(children, triggerProps);

  return <button {...triggerProps}>{children}</button>;
}

export interface AlertDialogContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  overlayClassName?: string;
}

export function AlertDialogContent({
  children,
  className,
  onKeyDown,
  overlayClassName,
  ...props
}: AlertDialogContentProps) {
  const { open, setOpen } = useAlertDialogContext("AlertDialogContent");
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;

    // Cleo shares the controlled state with the desktop HoverCard. The
    // mobile AlertDialog remains mounted for responsive switching, so avoid
    // stealing focus or installing a modal Escape handler while its layer is
    // CSS-hidden on wider screens.
    const layer = contentRef.current?.parentElement;
    if (layer && window.getComputedStyle(layer).display === "none") return;

    const previousFocus = document.activeElement as HTMLElement | null;
    contentRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div className={cn("fixed inset-0 z-[100]", overlayClassName)}>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[rgba(0,0,0,0.58)] backdrop-blur-[3px]"
        onClick={() => setOpen(false)}
      />
      <div
        aria-modal="true"
        className={cn("relative z-[1] outline-none", className)}
        ref={contentRef}
        role="alertdialog"
        tabIndex={-1}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || event.key !== "Tab") return;

          const focusable = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>(
              'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
            ),
          );

          if (focusable.length === 0) {
            event.preventDefault();
            return;
          }

          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}

export function AlertDialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grid gap-1.5", className)} data-slot="alert-dialog-header" {...props} />;
}

export function AlertDialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold", className)} data-slot="alert-dialog-title" {...props} />;
}

export function AlertDialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} data-slot="alert-dialog-description" {...props} />;
}

export function AlertDialogCancel({
  className,
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = useAlertDialogContext("AlertDialogCancel");

  return (
    <button
      className={cn(
        "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      data-slot="alert-dialog-cancel"
      type="button"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setOpen(false);
      }}
      {...props}
    />
  );
}
