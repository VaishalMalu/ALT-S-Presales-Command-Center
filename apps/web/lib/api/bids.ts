import { Bid, supabase } from "@repo/db";

export async function getBids(): Promise<Bid[]> {
  const { data, error } = await supabase
    .from("bids")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createBid(bid: Partial<Bid>): Promise<Bid> {
  const { data, error } = await supabase
    .from("bids")
    .insert([bid])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBid(id: string, updates: Partial<Bid>): Promise<Bid> {
  const { data, error } = await supabase
    .from("bids")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
