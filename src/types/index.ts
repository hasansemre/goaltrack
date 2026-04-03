// ─── Enums / Union Types ───────────────────────────────────────────────────

export type CategoryId =
  | 'walking'
  | 'cardio'
  | 'fitness'
  | 'yoga'
  | 'cycling'
  | 'swimming'
  | 'sports'
  | 'nutrition'
  | 'sleep'
  | 'meditation'
  | 'reading'
  | 'language'
  | 'education'
  | 'writing'
  | 'coding'
  | 'music'
  | 'art'
  | 'photography'
  | 'gaming'
  | 'cooking'
  | 'finance'
  | 'work'
  | 'social'
  | 'travel'
  | 'outdoor'
  | 'wellness';

export type GoalPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type DurationUnit = 'minutes' | 'hours' | 'seconds';
export type RepeatType = 'none' | 'daily' | 'weekdays' | 'custom';
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type BadgeConditionType = 'streak' | 'total_hours' | 'completion_rate' | 'total_days' | 'total_categories_used';
export type SyncOperation = 'create' | 'update' | 'delete';
export type SyncEntity = 'goals' | 'goalLogs' | 'userBadges';

// ─── Core Models ──────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface Goal {
  id: string;
  userId: string;
  categoryId: CategoryId;
  title: string;
  period: GoalPeriod;
  targetValue: number;
  targetUnit: DurationUnit;
  startDate: string; // ISO date string
  endDate?: string;
  repeatType?: RepeatType; // none = sadece startDate'de, daily = her gün, weekdays = hafta içi, custom = seçilen günler
  repeatDays?: number[]; // 0=Pazar...6=Cumartesi, repeatType==='custom' için
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  syncedAt?: string;
  localVersion: number;
}

export interface GoalLog {
  id: string;
  goalId: string;
  userId: string;
  date: string; // 'YYYY-MM-DD'
  completedValue: number;
  isCompleted: boolean;
  note?: string;
  createdAt: string;
  updatedAt: string;
  syncedAt?: string;
  localVersion: number;
}

// ─── Badge System ─────────────────────────────────────────────────────────

export interface BadgeCondition {
  type: BadgeConditionType;
  categoryId?: CategoryId;
  value: number;
  period?: GoalPeriod;
}

export interface Badge {
  id: string;
  categoryId?: CategoryId; // undefined = universal badge
  name: string;
  description: string;
  icon: string; // emoji
  tier: BadgeTier;
  condition: BadgeCondition;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: string;
  syncedAt?: string;
  localVersion: number;
}

// ─── Sync Queue ───────────────────────────────────────────────────────────

export interface SyncQueueItem {
  id?: number; // auto-increment (IndexedDB)
  entity: SyncEntity;
  entityId: string;
  operation: SyncOperation;
  payload: object;
  createdAt: string;
  retryCount: number;
}

// ─── Auth ─────────────────────────────────────────────────────────────────

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

// ─── UI Helpers ───────────────────────────────────────────────────────────

export interface DailyGoalItem {
  goal: Goal;
  log?: GoalLog;
  progress: number; // 0-100
}

export interface ProgressInfo {
  completed: number;
  target: number;
  percentage: number;
  unit: DurationUnit;
}
