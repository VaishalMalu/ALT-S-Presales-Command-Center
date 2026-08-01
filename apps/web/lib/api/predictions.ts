import { aiGateway } from "../ai-gateway";
import { Opportunity } from "@repo/db";
import { supabase } from "@repo/db"; // Using shared supabase client instance
import { WinPrediction } from "../ai-gateway/schemas";

/**
 * Executes a win prediction for an opportunity and saves the result to the DB.
 * This should ideally be triggered by a background job or DB webhook.
 */
export async function updateOpportunityWinPrediction(
  opportunityId: string,
): Promise<WinPrediction> {
  // 1. Fetch Opportunity + Account Data
  const { data: opportunity, error } = await supabase
    .from("opportunities")
    .select("*, account:account_id(*)")
    .eq("id", opportunityId)
    .single();

  if (error || !opportunity) {
    throw new Error("Opportunity not found");
  }

  // 2. Request prediction from AI Gateway
  const prediction = await aiGateway.predictWin(opportunity);

  // 3. Persist back to the database
  const { error: updateError } = await supabase
    .from("opportunities")
    .update({ ai_win_prediction: prediction.probability })
    .eq("id", opportunityId);

  if (updateError) {
    console.error("Failed to update DB with win prediction", updateError);
  }

  return prediction;
}
