import { Opportunity, OpportunityStage } from "@repo/db";
import { getMockData, setMockData, genId } from "./mock-db";

const TABLE = "opportunities";

export async function getOpportunities(): Promise<Opportunity[]> {
  const data = getMockData<Opportunity>(TABLE);
  return data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getOpportunity(id: string): Promise<Opportunity> {
  const data = getMockData<Opportunity>(TABLE);
  const opp = data.find(x => x.id === id);
  if (!opp) throw new Error("Not found");
  return opp;
}

export async function createOpportunity(opportunity: Partial<Opportunity>): Promise<Opportunity> {
  const data = getMockData<Opportunity>(TABLE);
  const newRecord = { ...opportunity, id: genId(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Opportunity;
  setMockData(TABLE, [newRecord, ...data]);
  return newRecord;
}

export async function updateOpportunity(id: string, updates: Partial<Opportunity>): Promise<Opportunity> {
  const data = getMockData<Opportunity>(TABLE);
  const idx = data.findIndex(x => x.id === id);
  if (idx === -1) throw new Error("Not found");
  data[idx] = { ...data[idx], ...updates, updated_at: new Date().toISOString() };
  setMockData(TABLE, data);
  return data[idx];
}

export async function deleteOpportunity(id: string): Promise<void> {
  const data = getMockData<Opportunity>(TABLE);
  setMockData(TABLE, data.filter(x => x.id !== id));
}

export async function transitionOpportunityStage(
  opportunityId: string,
  fromStage: OpportunityStage,
  toStage: OpportunityStage,
  reason: string = "",
  userId: string
): Promise<Opportunity> {
  return updateOpportunity(opportunityId, { stage: toStage });
}
