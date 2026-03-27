import Dexie, { type Table } from 'dexie';
import type { Goal, GoalLog, UserBadge, SyncQueueItem } from '@/types';

export class GoalTrackDB extends Dexie {
  goals!: Table<Goal>;
  goalLogs!: Table<GoalLog>;
  userBadges!: Table<UserBadge>;
  syncQueue!: Table<SyncQueueItem, number>;

  constructor() {
    super('GoalTrackDB');
    this.version(1).stores({
      goals: 'id, userId, categoryId, period, isActive, updatedAt',
      goalLogs: 'id, goalId, userId, date, isCompleted, updatedAt',
      userBadges: 'id, userId, badgeId, earnedAt',
      syncQueue: '++id, entity, entityId, operation, createdAt',
    });
  }
}

export const db = new GoalTrackDB();
