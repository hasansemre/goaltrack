import { db } from './database';
import type { SyncQueueItem, SyncEntity, SyncOperation } from '@/types';
import { format } from 'date-fns';

export async function addToSyncQueue(
  entity: SyncEntity,
  entityId: string,
  operation: SyncOperation,
  payload: object
): Promise<void> {
  const item: SyncQueueItem = {
    entity,
    entityId,
    operation,
    payload,
    createdAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
    retryCount: 0,
  };
  await db.syncQueue.add(item);
}

export async function getPendingSyncItems(): Promise<SyncQueueItem[]> {
  return db.syncQueue.toArray();
}

export async function removeSyncItem(id: number): Promise<void> {
  await db.syncQueue.delete(id);
}

export async function incrementRetry(id: number): Promise<void> {
  await db.syncQueue
    .where('id')
    .equals(id)
    .modify((item) => {
      item.retryCount += 1;
    });
}

export async function clearSyncQueue(): Promise<void> {
  await db.syncQueue.clear();
}
