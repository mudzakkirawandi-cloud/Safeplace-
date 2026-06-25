import { createClient } from "./supabase/client";

export async function setOnlineStatus(isOnline: boolean) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  const { data: user } = await supabase
    .from("users")
    .select("metadata")
    .eq("id", session.user.id)
    .single();

  if (!user) return;

  const updatedMetadata = {
    ...(user.metadata || {}),
    is_online: isOnline,
  };

  await supabase
    .from("users")
    .update({ metadata: updatedMetadata })
    .eq("id", session.user.id);
}
