"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, HelpCircle, Map, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { StudioDrawer } from "./StudioDrawer";

const FIELD_NAV = [
  { href: "/learner/map", label: "Map", icon: Map },
  { href: "/learner/water-fingerprints", label: "Capture", icon: Camera },
  { href: "/learner", label: "Guide", icon: HelpCircle },
] as const;

type LearnerFieldNavProps = {
  hidden?: boolean;
};

export function LearnerFieldNav({ hidden }: LearnerFieldNavProps) {
  const pathname = usePathname();

  if (hidden) return null;

  return (
    <nav
      aria-label="Field navigation"
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/50 bg-env-black/90 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-lg items-center justify-between px-2 py-2">
        <ul className="flex flex-1 items-center justify-around gap-1">
          {FIELD_NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1 text-xs",
                    active ? "text-primary" : "text-muted hover:text-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <Link
              href="/learner/map#safety"
              className="flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1 text-xs text-muted hover:text-foreground"
            >
              <Shield className="h-5 w-5" aria-hidden />
              <span>Safety</span>
            </Link>
          </li>
        </ul>
        <StudioDrawer variant="inline" className="ml-2 shrink-0" />
      </div>
    </nav>
  );
}
