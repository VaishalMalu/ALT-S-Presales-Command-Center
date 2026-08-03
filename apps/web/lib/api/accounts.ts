import { Account, supabase } from "@repo/db";
import { createAuditLog } from "./audit";

export async function getAccounts(): Promise<Account[]> {
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createAccount(account: Partial<Account>): Promise<Account> {
  const { data, error } = await supabase
    .from("accounts")
    .insert([account])
    .select()
    .single();

  if (error) throw error;

  // Log audit
  await createAuditLog({
    entity_type: "Account",
    entity_id: data.id,
    action_type: "CREATE",
    entity_name: data.name,
    changes: data,
  });

  return data;
}

export async function updateAccount(id: string, updates: Partial<Account>): Promise<Account> {
  // Fetch previous record to compute diff
  const { data: original } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", id)
    .single();

  const { data, error } = await supabase
    .from("accounts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  // Compute diff
  if (original) {
    const diff: Record<string, { old: any; new: any }> = {};
    let hasChanges = false;
    for (const key of Object.keys(updates)) {
      const typedKey = key as keyof Account;
      if (typedKey !== "updated_at" && original[typedKey] !== data[typedKey]) {
        diff[key] = { old: original[typedKey], new: data[typedKey] };
        hasChanges = true;
      }
    }

    if (hasChanges) {
      await createAuditLog({
        entity_type: "Account",
        entity_id: data.id,
        action_type: "UPDATE",
        entity_name: data.name,
        changes: diff,
      });
    }
  }

  return data;
}
