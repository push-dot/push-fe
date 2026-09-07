import { invoke, isTauri } from "@tauri-apps/api/core";
const openDb = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open("push-local", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("records");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
const readRecord = async <T>(
  accountId: string,
  key: string,
): Promise<T | null> => {
  if (!accountId) return null;
  if (isTauri()) {
    const value = await invoke<string | null>("local_read", { accountId, key });
    return value ? JSON.parse(value) : null;
  }
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("records");
    const req = tx.objectStore("records").get(`${accountId}:${key}`);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
};
const writeRecord = async (accountId: string, key: string, value: unknown) => {
  if (!accountId) throw new Error("로그인이 필요합니다.");
  if (isTauri())
    return invoke("local_write", {
      accountId,
      key,
      value: JSON.stringify(value),
    });
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("records", "readwrite");
    tx.objectStore("records").put(value, `${accountId}:${key}`);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
};

const pendingWrites = new Map<string, Promise<unknown>>();
const enqueue = <T>(
  accountId: string,
  key: string,
  operation: () => Promise<T>,
): Promise<T> => {
  const scope = `${accountId}:${key}`;
  const pending = (pendingWrites.get(scope) || Promise.resolve())
    .catch(() => undefined)
    .then(operation);
  pendingWrites.set(scope, pending);
  return pending.finally(() => {
    if (pendingWrites.get(scope) === pending) pendingWrites.delete(scope);
  });
};
export const localRead = <T>(
  accountId: string,
  key: string,
): Promise<T | null> =>
  enqueue(accountId, key, () => readRecord<T>(accountId, key));
export const localWrite = (accountId: string, key: string, value: unknown) =>
  enqueue(accountId, key, () => writeRecord(accountId, key, value));
export const localUpdate = <T>(
  accountId: string,
  key: string,
  transform: (current: T | null) => T | null,
): Promise<T | null> =>
  enqueue(accountId, key, async () => {
    const next = transform(await readRecord<T>(accountId, key));
    await writeRecord(accountId, key, next);
    return next;
  });
