"use client";

import { usePathname } from "next/navigation";
import { PrototypeBanner } from "@/components/shared/PrototypeBanner";
import { RoleSwitcher } from "@/components/shared/RoleSwitcher";
import { StudioDrawer } from "@/components/learner/StudioDrawer";

type AppChromeProps = {
  children: React.ReactNode;
  connectedHeader?: React.ReactNode;
};

function isImmersiveRoute(pathname: string): boolean {
  return pathname === "/" || pathname.startsWith("/learner");
}

function isPublicEntrance(pathname: string): boolean {
  return pathname === "/";
}

export function AppChrome({ children, connectedHeader }: AppChromeProps) {
  const pathname = usePathname();
  const immersive = isImmersiveRoute(pathname);
  const entrance = isPublicEntrance(pathname);

  if (entrance) {
    return (
      <>
        <PrototypeBanner compact />
        <div className="fixed right-4 top-8 z-40 md:right-6 md:top-10">
          <StudioDrawer />
        </div>
        <main id="main-content">{children}</main>
      </>
    );
  }

  if (immersive) {
    return (
      <>
        <PrototypeBanner compact />
        <header className="fixed left-0 right-0 top-6 z-20 border-b border-border/30 bg-env-black/80 px-4 py-2 backdrop-blur-md">
          <div className="mx-auto flex max-w-lg items-center justify-between">
            <p className="text-xs uppercase tracking-widest text-muted">LOCUS</p>
            <StudioDrawer variant="inline" />
          </div>
        </header>
        <main id="main-content" className="pt-12">
          {children}
        </main>
      </>
    );
  }

  return (
    <>
      <PrototypeBanner />
      <header className="border-b border-border bg-surface px-4 py-3">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted">LOCUS</p>
            <h1 className="text-lg font-semibold">Journey Studio</h1>
          </div>
          {connectedHeader}
          <RoleSwitcher />
        </div>
      </header>
      <main id="main-content">{children}</main>
    </>
  );
}
