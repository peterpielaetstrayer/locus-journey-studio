"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function signIn(formData: FormData) {
  if (!isSupabaseConfigured()) {
    return { error: "Connected Mode is unavailable — Supabase is not configured." };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/creator");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Sign-in failed. This prototype uses invite-only adult accounts." };
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signOut() {
  if (!isSupabaseConfigured()) {
    redirect("/");
  }
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function getSessionUser() {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

export async function getConnectedProfile(): Promise<{
  user: { id: string; email?: string };
  profile: { id: string; display_name: string; email: string } | null;
  memberships: Array<{ role: string; organization_id: string }>;
} | null> {
  const user = await getSessionUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, email")
    .eq("id", user.id)
    .maybeSingle();
  const { data: memberships } = await supabase
    .from("organization_memberships")
    .select("role, organization_id")
    .eq("profile_id", user.id);
  return {
    user: { id: user.id, email: user.email },
    profile: profile as { id: string; display_name: string; email: string } | null,
    memberships: (memberships ?? []) as Array<{ role: string; organization_id: string }>,
  };
}
