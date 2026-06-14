import { createClient } from "./supabase/client";

export async function logAudit(action: string, entityType: string, entityId: string, details?: Record<string, unknown>) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return; // Ignore if not authenticated

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details: details || {},
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error("Failed to log audit:", error);
  }
}
