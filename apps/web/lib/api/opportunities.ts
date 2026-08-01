import { supabase, Opportunity, OpportunityStage } from "@repo/db";

export async function getOpportunities(): Promise<Opportunity[]> {
  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
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

export async function createOpportunity(
  opportunity: Partial<Opportunity>,
): Promise<Opportunity> {
  const { data, error } = await supabase
    .from("opportunities")
    .insert(opportunity)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateOpportunity(
  id: string,
  updates: Partial<Opportunity>,
): Promise<Opportunity> {
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
  const { error } = await supabase.from("opportunities").delete().eq("id", id);

  if (error) throw error;
}

/**
 * State Machine Transition
 * Explicitly inserts an audit record whenever an opportunity's stage is updated.
 */
export async function transitionOpportunityStage(
  opportunityId: string,
  fromStage: OpportunityStage,
  toStage: OpportunityStage,
  reason: string = "",
  userId: string,
): Promise<Opportunity> {
  // 1. Update the opportunity stage
  const { data: updatedOpp, error: updateError } = await supabase
    .from("opportunities")
    .update({ stage: toStage, updated_at: new Date().toISOString() })
    .eq("id", opportunityId)
    .select()
    .single();

  if (updateError) throw updateError;

  // 2. Insert into audit history
  const { error: auditError } = await supabase
    .from("opportunity_state_history")
    .insert({
      opportunity_id: opportunityId,
      changed_by: userId,
      from_stage: fromStage,
      to_stage: toStage,
      reason: reason,
    });

  if (auditError) {
    console.error(
      "Failed to write audit history for state transition:",
      auditError,
    );
    // Depending on strictness, we might throw here or just log it.
    // For Enterprise, we throw to ensure the transaction is recorded (or use an RPC).
    throw auditError;
  }

  return updatedOpp;
}
