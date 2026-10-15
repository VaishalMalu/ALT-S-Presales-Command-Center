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

    if (!error && data && data.length > 0) {
      return data;
    }

    // If empty or error in mock mode, check localStorage fallback
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("mock_db_audit_logs");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.sort(
            (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
          );
        }
      }
    }

    if (error) {
      console.warn("Could not fetch audit logs:", error.message);
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
      // Fallback save to localStorage in browser environment
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("mock_db_audit_logs");
        const list = raw ? JSON.parse(raw) : [];
        list.unshift({ ...newLog, id: Math.random().toString(36).substring(2, 11) });
        localStorage.setItem("mock_db_audit_logs", JSON.stringify(list));
      }
    }
  } catch (err: any) {
    console.error("Error creating audit log:", err);
  }
}
