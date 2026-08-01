import { Account } from "@repo/db";
import { getMockData, setMockData, genId } from "./mock-db";

const TABLE = "accounts";

export async function getAccounts(): Promise<Account[]> {
  const data = getMockData<Account>(TABLE);
  return data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function createAccount(account: Partial<Account>): Promise<Account> {
  const data = getMockData<Account>(TABLE);
  const newRecord = { ...account, id: genId(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Account;
  setMockData(TABLE, [newRecord, ...data]);
  return newRecord;
}

export async function updateAccount(id: string, updates: Partial<Account>): Promise<Account> {
  const data = getMockData<Account>(TABLE);
  const idx = data.findIndex(x => x.id === id);
  if (idx === -1) throw new Error("Not found");
  data[idx] = { ...data[idx], ...updates, updated_at: new Date().toISOString() };
  setMockData(TABLE, data);
  return data[idx];
}
