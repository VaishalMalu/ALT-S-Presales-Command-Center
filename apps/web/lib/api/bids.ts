import { supabase, Bid } from '@repo/db';

export async function getBids(): Promise<any[]> {
  const { data, error } = await supabase
    .from('bids')
    .select('*, opportunities(title)')
    .order('submission_deadline', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createBid(bid: Partial<Bid>): Promise<Bid> {
  const { data, error } = await supabase
    .from('bids')
    .insert(bid)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBid(id: string, updates: Partial<Bid>): Promise<Bid> {
  const { data, error } = await supabase
    .from('bids')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
