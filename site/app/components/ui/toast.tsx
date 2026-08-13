"use client";

import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import * as React from "react";

import { cn } from "@/lib/utils";

function ToastProvider(
  props: React.ComponentProps<typeof ToastPrimitive.Provider>,
) {
  return <ToastPrimitive.Provider data-slot="toast-provider" {...props} />;
}

function ToastViewport({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Viewport>) {
  return (
    <ToastPrimitive.Viewport
      className={cn(
        "pointer-events-none fixed inset-x-4 bottom-4 z-[90] mx-auto flex w-auto max-w-xl flex-col gap-2 outline-none [&>*]:pointer-events-auto",
        className,
      )}
      data-slot="toast-viewport"
      {...props}
    />
  );
}

function ToastRoot({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Root>) {
  return (
    <ToastPrimitive.Root
      className={cn(
        "w-full rounded-none border border-[var(--dark-line)] bg-[var(--dark-bg)] text-[var(--dark-fg)] shadow-[0_20px_70px_rgba(0,0,0,0.28)] transition-[opacity,transform] duration-300 data-[ending-style]:translate-y-4 data-[ending-style]:opacity-0 data-[starting-style]:translate-y-4 data-[starting-style]:opacity-0",
        className,
      )}
      data-slot="toast"
      {...props}
    />
  );
}

function ToastContent({ className, ...props }: React.ComponentProps<typeof ToastPrimitive.Content>) {
  return (
    <ToastPrimitive.Content
      className={cn("outline-none focus-visible:ring-2 focus-visible:ring-[var(--acid)]", className)}
      data-slot="toast-content"
      {...props}
    />
  );
}

function ToastTitle({ className, ...props }: React.ComponentProps<typeof ToastPrimitive.Title>) {
  return (
    <ToastPrimitive.Title
      className={cn("font-semibold", className)}
      data-slot="toast-title"
      {...props}
    />
  );
}

function ToastDescription({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Description>) {
  return (
    <ToastPrimitive.Description
      className={cn("text-sm text-[var(--dark-fg)]/80", className)}
      data-slot="toast-description"
      {...props}
    />
  );
}

function ToastClose({ className, ...props }: React.ComponentProps<typeof ToastPrimitive.Close>) {
  return (
    <ToastPrimitive.Close
      className={cn(
        "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--acid)]",
        className,
      )}
      data-slot="toast-close"
      {...props}
    />
  );
}
const ToastPortal = ToastPrimitive.Portal;
const useToastManager = ToastPrimitive.useToastManager;

export {
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastPortal,
  ToastProvider,
  ToastRoot,
  ToastTitle,
  ToastViewport,
  useToastManager,
};
