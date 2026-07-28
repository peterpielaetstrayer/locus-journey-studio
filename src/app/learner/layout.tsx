"use client";

import { usePathname } from "next/navigation";
import { LearnerFieldNav } from "@/components/learner/LearnerFieldNav";

const QUIET_ROUTES = ["/learner/hidden-flow"];

export default function LearnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isQuiet = QUIET_ROUTES.some((r) => pathname.startsWith(r));

  return (
    <div className="learner-surface min-h-dvh">
      <div className="mx-auto max-w-lg px-4 py-4 pb-24">{children}</div>
      <LearnerFieldNav hidden={isQuiet} />
    </div>
  );
}
