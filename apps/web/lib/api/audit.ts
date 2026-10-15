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
  try {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Could not fetch audit logs:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn("Error fetching audit logs:", err);
    return [];
  }
}

export async function createAuditLog(log: AuditLog): Promise<void> {
  try {
    // Attempt to get the current user's email safely
    let userEmail = "Anonymous";
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user?.email) {
        userEmail = data.session.user.email;
      } else if (typeof supabase.auth.getUser === "function") {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user?.email) {
          userEmail = userData.user.email;
        }
      }
    } catch {
      // Fallback to Anonymous
    }

    const newLog = {
      ...log,
      changed_by: userEmail,
      created_at: log.created_at || new Date().toISOString(),
    };

    const { error } = await supabase.from("audit_logs").insert([newLog]);
    if (error) {
      console.warn("Could not insert audit log into database:", error.message);
    }
  } catch (err: any) {
    console.error("Error creating audit log:", err);
  }
}
