import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export interface PurchaseRecord {
  sessionId: string;
  email?: string;
  source: "stripe-payment-link";
  createdAt: string;
}

interface PurchaseStore {
  purchases: PurchaseRecord[];
}

const DATA_DIRECTORY = path.join(process.cwd(), ".data");
const DATABASE_PATH = path.join(DATA_DIRECTORY, "purchases.json");

async function ensureStore(): Promise<void> {
  await mkdir(DATA_DIRECTORY, { recursive: true });

  try {
    await readFile(DATABASE_PATH, "utf8");
  } catch {
    await writeDatabase({ purchases: [] });
  }
}

async function readDatabase(): Promise<PurchaseStore> {
  await ensureStore();

  const raw = await readFile(DATABASE_PATH, "utf8");
  const parsed = JSON.parse(raw) as Partial<PurchaseStore>;

  return {
    purchases: Array.isArray(parsed.purchases) ? parsed.purchases : []
  };
}

async function writeDatabase(store: PurchaseStore): Promise<void> {
  await mkdir(DATA_DIRECTORY, { recursive: true });

  const temporaryPath = `${DATABASE_PATH}.tmp`;
  await writeFile(temporaryPath, JSON.stringify(store, null, 2), "utf8");
  await rename(temporaryPath, DATABASE_PATH);
}

export async function addPurchaseRecord(record: PurchaseRecord): Promise<void> {
  const store = await readDatabase();

  const alreadyRecorded = store.purchases.some((purchase) => purchase.sessionId === record.sessionId);
  if (alreadyRecorded) {
    return;
  }

  store.purchases.push(record);
  await writeDatabase(store);
}

export async function getPurchaseBySessionId(sessionId: string): Promise<PurchaseRecord | null> {
  const store = await readDatabase();
  return store.purchases.find((record) => record.sessionId === sessionId) ?? null;
}
