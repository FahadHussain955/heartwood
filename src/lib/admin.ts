import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { AdminProfile } from "@/components/admin/shared";

/** The signed-in user's row in public.admins, or null if they are not signed in or not an admin. Cached per request. */
export const getAdmin = cache(async (): Promise<AdminProfile | null> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("admins").select("user_id, email, name, role").eq("user_id", user.id).maybeSingle();
  return data as AdminProfile | null;
});
