import { normalizeStoreProject } from "./project";
import type { StoreProject } from "./types";

const DB_NAME = "screenshotstudio-store-projects";
const STORE_NAME = "projects";
const ACTIVE_PROJECT_KEY = "active-store-project";
export const STORE_PROJECT_HINT_COOKIE = "screenshot-studio-store-active";

function updateStoreProjectHint(active: boolean): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const maxAge = active ? 31_536_000 : 0;
  document.cookie = `${STORE_PROJECT_HINT_COOKIE}=${active ? "1" : ""}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

function openStoreDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

export async function loadStoreProject(): Promise<StoreProject | null> {
  let db: IDBDatabase | null = null;
  try {
    const openedDatabase = await openStoreDatabase();
    db = openedDatabase;
    const stored = await new Promise<unknown>((resolve, reject) => {
      const request = openedDatabase.transaction(STORE_NAME, "readonly")
        .objectStore(STORE_NAME)
        .get(ACTIVE_PROJECT_KEY);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const project = normalizeStoreProject(stored);
    updateStoreProjectHint(Boolean(project));
    return project;
  } catch {
    return null;
  } finally {
    db?.close();
  }
}

export async function saveStoreProject(project: StoreProject): Promise<void> {
  const db = await openStoreDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.objectStore(STORE_NAME).put(project, ACTIVE_PROJECT_KEY);
    });
    updateStoreProjectHint(true);
  } finally {
    db.close();
  }
}

export async function deleteStoreProject(): Promise<void> {
  const db = await openStoreDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.objectStore(STORE_NAME).delete(ACTIVE_PROJECT_KEY);
    });
    updateStoreProjectHint(false);
  } finally {
    db.close();
  }
}
