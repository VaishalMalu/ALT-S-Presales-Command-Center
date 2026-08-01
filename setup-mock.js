const fs = require('fs');
const path = require('path');

const API_DIR = path.join(__dirname, 'apps/web/lib/api');

const accountsContent = `import { Account } from "@repo/db";
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
`;

const opportunitiesContent = `import { Opportunity, OpportunityStage } from "@repo/db";
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
`;

const bidsContent = `import { Bid } from "@repo/db";
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
`;

const contactsContent = `import { Contact } from "@repo/db";
import { getMockData, setMockData, genId } from "./mock-db";

const TABLE = "contacts";

export async function getContacts(): Promise<Contact[]> {
  const data = getMockData<Contact>(TABLE);
  return data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function createContact(contact: Partial<Contact>): Promise<Contact> {
  const data = getMockData<Contact>(TABLE);
  const newRecord = { ...contact, id: genId(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Contact;
  setMockData(TABLE, [newRecord, ...data]);
  return newRecord;
}

export async function updateContact(id: string, updates: Partial<Contact>): Promise<Contact> {
  const data = getMockData<Contact>(TABLE);
  const idx = data.findIndex(x => x.id === id);
  if (idx === -1) throw new Error("Not found");
  data[idx] = { ...data[idx], ...updates, updated_at: new Date().toISOString() };
  setMockData(TABLE, data);
  return data[idx];
}
`;

const tasksContent = `import { Task } from "@repo/db";
import { getMockData, setMockData, genId } from "./mock-db";

const TABLE = "tasks";

export async function getTasks(): Promise<Task[]> {
  const data = getMockData<Task>(TABLE);
  return data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function createTask(task: Partial<Task>): Promise<Task> {
  const data = getMockData<Task>(TABLE);
  const newRecord = { ...task, id: genId(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Task;
  setMockData(TABLE, [newRecord, ...data]);
  return newRecord;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const data = getMockData<Task>(TABLE);
  const idx = data.findIndex(x => x.id === id);
  if (idx === -1) throw new Error("Not found");
  data[idx] = { ...data[idx], ...updates, updated_at: new Date().toISOString() };
  setMockData(TABLE, data);
  return data[idx];
}
`;

fs.writeFileSync(path.join(API_DIR, 'accounts.ts'), accountsContent);
fs.writeFileSync(path.join(API_DIR, 'opportunities.ts'), opportunitiesContent);
fs.writeFileSync(path.join(API_DIR, 'bids.ts'), bidsContent);
fs.writeFileSync(path.join(API_DIR, 'contacts.ts'), contactsContent);
fs.writeFileSync(path.join(API_DIR, 'tasks.ts'), tasksContent);

console.log('Successfully switched APIs to Mock DB!');
