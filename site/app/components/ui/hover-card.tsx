"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type HoverCardContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const HoverCardContext = React.createContext<HoverCardContextValue | null>(
  null,
);

function useHoverCardContext(component: string) {
  const context = React.useContext(HoverCardContext);

  if (!context) {
    throw new Error(`${component} must be used inside HoverCard`);
  }

  return context;
}

export interface HoverCardProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  openDelay?: number;
  closeDelay?: number;
  openOnHover?: boolean;
}

export function HoverCard({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  openDelay = 120,
  closeDelay = 100,
  openOnHover = true,
}: HoverCardProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const openTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) setUncontrolledOpen(nextOpen);
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange],
  );

  const scheduleOpen = React.useCallback(() => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = setTimeout(() => setOpen(true), openDelay);
  }, [openDelay, setOpen]);

  const scheduleClose = React.useCallback(() => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), closeDelay);
  }, [closeDelay, setOpen]);

  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, setOpen]);

  React.useEffect(
    () => () => {
      if (openTimer.current) clearTimeout(openTimer.current);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  return (
    <HoverCardContext.Provider value={{ open: Boolean(open), setOpen }}>
      <span
        className="relative inline-flex"
        onPointerEnter={openOnHover ? scheduleOpen : undefined}
        onPointerLeave={openOnHover ? scheduleClose : undefined}
      >
        {children}
      </span>
    </HoverCardContext.Provider>
  );
}

export interface HoverCardTriggerProps
  extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean;
  children: React.ReactElement;
}

export function HoverCardTrigger({
  asChild = false,
  children,
  onClick,
  onFocus,
  onKeyDown,
  ...props
}: HoverCardTriggerProps) {
  const { open, setOpen } = useHoverCardContext("HoverCardTrigger");
  const childProps = React.isValidElement<{
    onClick?: React.MouseEventHandler<HTMLElement>;
    onFocus?: React.FocusEventHandler<HTMLElement>;
    onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
  }>(children)
    ? children.props
    : {};
  const triggerProps = {
    ...props,
    "aria-expanded": open,
    "aria-haspopup": "dialog" as const,
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      childProps.onClick?.(event);
      onClick?.(event);
      if (!event.defaultPrevented) setOpen(!open);
    },
    onFocus: (event: React.FocusEvent<HTMLElement>) => {
      childProps.onFocus?.(event);
      onFocus?.(event);
      if (!event.defaultPrevented) setOpen(true);
    },
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
      childProps.onKeyDown?.(event);
      onKeyDown?.(event);
      if (!event.defaultPrevented && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        setOpen(!open);
      }
    },
  };

  if (asChild) return React.cloneElement(children, triggerProps);

  return (
    <button type="button" {...triggerProps}>
      {children}
    </button>
  );
}

export interface HoverCardContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function HoverCardContent({
  children,
  className,
  ...props
}: HoverCardContentProps) {
  const { open } = useHoverCardContext("HoverCardContent");

  if (!open) return null;

  return (
    <div
      aria-hidden={false}
      className={cn("absolute z-50 outline-none", className)}
      data-slot="hover-card-content"
      data-state="open"
      role="dialog"
      tabIndex={-1}
      {...props}
    >
      {children}
    </div>
  );
}
