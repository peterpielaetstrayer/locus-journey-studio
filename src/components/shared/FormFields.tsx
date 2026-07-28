import { cn } from "@/lib/utils";
import type { LabelHTMLAttributes, TextareaHTMLAttributes, InputHTMLAttributes } from "react";

export function Label({
  className,
  children,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("block text-sm font-medium mb-1.5", className)}
      {...props}
    >
      {children}
    </label>
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full min-h-24 rounded-lg border border-border bg-surface-raised px-4 py-3 text-foreground placeholder:text-muted focus-visible:ring-2 focus-visible:ring-ring resize-y",
        className,
      )}
      {...props}
    />
  );
}

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full min-h-11 rounded-lg border border-border bg-surface-raised px-4 py-2 text-foreground placeholder:text-muted focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full min-h-11 rounded-lg border border-border bg-surface-raised px-4 py-2 text-foreground focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
