import { Bid } from "@repo/db";
import { getMockData, setMockData, genId } from "./mock-db";

const TABLE = "bids";

export async function getBids(): Promise<Bid[]> {
  const data = getMockData<Bid>(TABLE);
  return data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function createBid(bid: Partial<Bid>): Promise<Bid> {
  const data = getMockData<Bid>(TABLE);
  const newRecord = { ...bid, id: genId(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Bid;
  setMockData(TABLE, [newRecord, ...data]);
  return newRecord;
}

export async function updateBid(id: string, updates: Partial<Bid>): Promise<Bid> {
  const data = getMockData<Bid>(TABLE);
  const idx = data.findIndex(x => x.id === id);
  if (idx === -1) throw new Error("Not found");
  data[idx] = { ...data[idx], ...updates, updated_at: new Date().toISOString() };
  setMockData(TABLE, data);
  return data[idx];
}
