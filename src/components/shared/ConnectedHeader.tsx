import Link from "next/link";
import { getConnectedProfile, getSessionUser } from "@/lib/auth/actions";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ModeIndicator } from "./ModeIndicator";

export async function ConnectedHeader() {
  const configured = isSupabaseConfigured();
  const user = configured ? await getSessionUser() : null;
  const profile = user ? await getConnectedProfile() : null;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <ModeIndicator configured={configured} connected={Boolean(user)} />
      {configured && user ? (
        <div className="flex items-center gap-2 text-xs text-muted">
          <span>{profile?.profile?.display_name ?? user.email}</span>
          <form action="/api/auth/signout" method="post">
            <button type="submit" className="underline hover:text-foreground">
              Sign out
            </button>
          </form>
        </div>
      ) : configured ? (
        <Link href="/login" className="text-xs text-primary underline">
          Adult sign in
        </Link>
      ) : null}
    </div>
  );
}
