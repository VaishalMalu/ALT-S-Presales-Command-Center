import { Contact } from "@repo/db";
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
