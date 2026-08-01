import { Opportunity, OpportunityStage, supabase } from "@repo/db";

export async function getOpportunities(): Promise<Opportunity[]> {
  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getOpportunity(id: string): Promise<Opportunity> {
  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createOpportunity(opportunity: Partial<Opportunity>): Promise<Opportunity> {
  const { data, error } = await supabase
    .from("opportunities")
    .insert([opportunity])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateOpportunity(id: string, updates: Partial<Opportunity>): Promise<Opportunity> {
  const { data, error } = await supabase
    .from("opportunities")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteOpportunity(id: string): Promise<void> {
  const { error } = await supabase
    .from("opportunities")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function transitionOpportunityStage(
  opportunityId: string,
  fromStage: OpportunityStage,
  toStage: OpportunityStage,
  reason: string = "",
  userId: string
): Promise<Opportunity> {
  const { data, error } = await supabase.rpc("transition_opportunity_stage", {
    p_opportunity_id: opportunityId,
    p_from_stage: fromStage,
    p_to_stage: toStage,
    p_reason: reason,
    p_user_id: userId
  });

  if (error) {
    // Fallback if RPC doesn't exist: manually insert history and update
    await supabase.from("opportunity_state_history").insert([{
      opportunity_id: opportunityId,
      from_stage: fromStage,
      to_stage: toStage,
      reason,
      changed_by: userId
    }]);
    return updateOpportunity(opportunityId, { stage: toStage });
  }
  
  return updateOpportunity(opportunityId, { stage: toStage });
}
