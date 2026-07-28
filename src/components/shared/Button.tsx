import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "parchment";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none",
        {
          "bg-primary text-primary-foreground hover:bg-primary/90": variant === "primary",
          "bg-surface-raised text-foreground hover:bg-surface-raised/80 border border-border":
            variant === "secondary",
          "text-foreground hover:bg-surface-raised": variant === "ghost",
          "bg-danger text-white hover:bg-danger/90": variant === "danger",
          "bg-parchment text-parchment-ink hover:bg-parchment/90": variant === "parchment",
          "min-h-11 px-4 py-2 text-sm": size === "sm",
          "min-h-11 px-6 py-3 text-base": size === "md",
          "min-h-12 px-8 py-4 text-lg": size === "lg",
        },
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
