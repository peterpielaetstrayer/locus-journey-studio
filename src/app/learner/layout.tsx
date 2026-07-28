"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const STEPS = [
  { href: "/learner", label: "Start" },
  { href: "/learner/preparation", label: "Prepare" },
  { href: "/learner/map", label: "Map" },
  { href: "/learner/water-fingerprints", label: "Observe" },
  { href: "/learner/comparison", label: "Compare" },
  { href: "/learner/systems", label: "System" },
  { href: "/learner/exit-claim", label: "Claim" },
  { href: "/learner/artifact", label: "Artifact" },
  { href: "/learner/resurfacing", label: "Returns" },
];

export default function LearnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="learner-surface min-h-[calc(100dvh-8rem)]">
      <div className="mx-auto max-w-lg px-4 py-6 pb-24">{children}</div>
      <nav
        aria-label="Learner journey steps"
        className="fixed bottom-0 left-0 right-0 border-t border-border bg-surface/95 backdrop-blur-sm"
      >
        <ul className="mx-auto flex max-w-lg overflow-x-auto gap-1 px-2 py-2">
          {STEPS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "block min-h-11 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted hover:text-foreground",
                  )}
                  aria-current={active ? "step" : undefined}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
