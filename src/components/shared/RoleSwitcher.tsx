"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDemoStore } from "@/store/demo-store";
import type { UserRole } from "@/types";

const ROLES: { role: UserRole; label: string; href: string }[] = [
  { role: "creator", label: "Create", href: "/creator" },
  { role: "learner", label: "Experience", href: "/learner" },
  { role: "orchestrator", label: "Orchestrate", href: "/orchestrator" },
  { role: "reviewer", label: "Review", href: "/reviewer" },
];

export function RoleSwitcher() {
  const pathname = usePathname();
  const { activeRole, setActiveRole, resetDemo } = useDemoStore();

  return (
    <nav
      aria-label="Role switcher"
      className="flex flex-wrap items-center gap-2"
    >
      {ROLES.map(({ role, label, href }) => {
        const isActive =
          activeRole === role ||
          pathname.startsWith(href);
        return (
          <Link
            key={role}
            href={href}
            onClick={() => setActiveRole(role)}
            className={cn(
              "min-h-11 min-w-11 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-surface-raised text-foreground hover:bg-surface-raised/80",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={() => {
          if (window.confirm("Reset all demo progress and return to initial state?")) {
            resetDemo();
          }
        }}
        className="min-h-11 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-muted hover:text-foreground hover:bg-surface-raised transition-colors"
        aria-label="Reset demo"
      >
        <RotateCcw className="h-4 w-4" aria-hidden />
        Reset
      </button>
    </nav>
  );
}
