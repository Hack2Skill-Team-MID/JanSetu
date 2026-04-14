/**
 * JanSetu Offline Queue — IndexedDB helper
 * Queues failed POST/PUT/DELETE requests and replays them when back online.
 */

const DB_NAME = 'jansetu-offline';
const DB_VERSION = 1;
const STORE_NAME = 'pending-requests';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface PendingRequest {
  id?: number;
  url: string;
  method: string;
  body: string | null;
  headers: Record<string, string>;
  timestamp: number;
}

/** Queue a failed request for later replay */
export async function queueRequest(req: PendingRequest): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).add({ ...req, timestamp: Date.now() });
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Get all pending requests */
export async function getPendingRequests(): Promise<PendingRequest[]> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Remove a request after successful replay */
export async function removePendingRequest(id: number): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).delete(id);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Replay all pending requests (call on reconnect) */
export async function replayPendingRequests(): Promise<{ replayed: number; failed: number }> {
  const pending = await getPendingRequests();
  let replayed = 0;
  let failed = 0;

  for (const req of pending) {
    try {
      const response = await fetch(req.url, {
        method: req.method,
        headers: req.headers,
        body: req.body,
      });

      if (response.ok && req.id) {
        await removePendingRequest(req.id);
        replayed++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }

  return { replayed, failed };
}

/** Get count of pending requests */
export async function getPendingCount(): Promise<number> {
  const pending = await getPendingRequests();
  return pending.length;
}

// Auto-replay on reconnect
if (typeof window !== 'undefined') {
  window.addEventListener('online', async () => {
    console.log('🌐 Back online — replaying pending requests...');
    const result = await replayPendingRequests();
    if (result.replayed > 0) {
      console.log(`✅ Replayed ${result.replayed} requests`);
    }
    if (result.failed > 0) {
      console.warn(`⚠️ ${result.failed} requests failed to replay`);
    }
  });
}
