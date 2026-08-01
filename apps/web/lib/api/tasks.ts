import { Task } from "@repo/db";
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
