import { supabase, Contact } from "@repo/db";

export async function getContacts(): Promise<any[]> {
  const { data, error } = await supabase
    .from("contacts")
    .select("*, accounts(name)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createContact(
  contact: Partial<Contact>,
): Promise<Contact> {
  const { data, error } = await supabase
    .from("contacts")
    .insert(contact)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateContact(
  id: string,
  updates: Partial<Contact>,
): Promise<Contact> {
  const { data, error } = await supabase
    .from("contacts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
