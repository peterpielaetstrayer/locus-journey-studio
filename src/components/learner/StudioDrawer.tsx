"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDemoStore } from "@/store/demo-store";

const STUDIO_LINKS = [
  { href: "/creator", label: "Creator Studio" },
  { href: "/orchestrator", label: "Orchestrator View" },
  { href: "/reviewer", label: "Reviewer View" },
  { href: "/learner", label: "Journey Overview" },
] as const;

type StudioDrawerProps = {
  className?: string;
  variant?: "overlay" | "inline";
};

export function StudioDrawer({ className, variant = "overlay" }: StudioDrawerProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { resetDemo } = useDemoStore();

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  function handleReset() {
    if (window.confirm("Reset all demo progress and return to initial state?")) {
      resetDemo();
      setOpen(false);
    }
  }

  return (
    <div className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "min-h-11 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
          variant === "overlay"
            ? "bg-env-black/50 text-foreground/80 backdrop-blur-sm hover:bg-env-black/70 hover:text-foreground"
            : "border border-border bg-surface-raised text-muted hover:text-foreground",
        )}
        aria-expanded={open}
        aria-controls="studio-drawer-panel"
      >
        Studio
      </button>

      {open && (
        <>
          {variant === "overlay" && (
            <button
              type="button"
              className="fixed inset-0 z-40 bg-env-black/40"
              aria-label="Close Studio menu"
              onClick={() => setOpen(false)}
            />
          )}
          <div
            ref={panelRef}
            id="studio-drawer-panel"
            role="dialog"
            aria-label="Journey Studio access"
            className={cn(
              "z-50 rounded-xl border border-border bg-surface p-4 shadow-xl",
              variant === "overlay"
                ? "fixed right-4 top-16 w-72 md:right-6 md:top-20"
                : "absolute right-0 top-full mt-2 w-64",
            )}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-muted">Journey Studio</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-lg text-muted hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <nav aria-label="Studio modes">
              <ul className="space-y-1">
                {STUDIO_LINKS.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                      className="block min-h-11 rounded-lg px-3 py-2 text-sm hover:bg-surface-raised"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <button
              type="button"
              onClick={handleReset}
              className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted hover:bg-surface-raised hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Reset Demo
            </button>

            <p className="mt-3 text-xs text-muted">
              Field-Test Draft · Prototype · Not production-ready
            </p>
          </div>
        </>
      )}
    </div>
  );
}
