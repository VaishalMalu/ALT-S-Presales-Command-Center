import { supabase } from "@repo/db";

export interface AuditLog {
  id?: string;
  entity_type: "Account" | "Opportunity";
  entity_id: string;
  action_type: "CREATE" | "UPDATE";
  changed_by?: string | null;
  changes: any; // Diff details or created state details
  entity_name?: string | null;
  created_at?: string;
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Could not fetch audit logs (table may not exist yet):", error.message);
    return [];
  }
  return data || [];
}

export async function createAuditLog(log: AuditLog): Promise<void> {
  try {
    // Attempt to get the current user's email
    let userEmail = "Anonymous";
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email) {
      userEmail = session.user.email;
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        userEmail = user.email;
      }
    }

    const { error } = await supabase.from("audit_logs").insert([
      {
        ...log,
        changed_by: userEmail,
      },
    ]);

    if (error) {
      console.warn("Could not insert audit log (table may not exist yet):", error.message);
    }
  } catch (err: any) {
    console.error("Error creating audit log:", err);
  }
}
