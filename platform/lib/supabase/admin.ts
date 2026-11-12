import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { supabase, user: null, isAdmin: false };
  const isAdmin = user.app_metadata?.darktec_admin === true;
  return { supabase, user, isAdmin };
}
