"use client";

import { usePathname } from "next/navigation";
import { LearnerFieldNav } from "@/components/learner/LearnerFieldNav";

const QUIET_ROUTES = ["/learner/hidden-flow"];

const FULL_BLEED_ROUTES = [
  "/learner",
  "/learner/water-fingerprints",
  "/learner/cypress-knee",
  "/learner/artifact",
];

export default function LearnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isQuiet = QUIET_ROUTES.some((r) => pathname.startsWith(r));
  const isFullBleed = FULL_BLEED_ROUTES.some((r) => pathname === r);

  return (
    <div className="learner-surface min-h-dvh">
      {isFullBleed ? (
        <div className="pb-24">{children}</div>
      ) : (
        <div className="mx-auto max-w-lg px-4 py-4 pb-24">{children}</div>
      )}
      <LearnerFieldNav hidden={isQuiet} />
    </div>
  );
}
