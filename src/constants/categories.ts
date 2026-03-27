import type { Category } from '@/types';

export const CATEGORIES: Category[] = [
  {
    id: 'walking',
    name: 'Yürüyüş',
    icon: '🚶',
    color: '#22c55e',
    description: 'Günlük yürüyüş ve adım hedefleri',
  },
  {
    id: 'cardio',
    name: 'Kardiyo',
    icon: '🏃',
    color: '#f97316',
    description: 'Koşu, bisiklet ve kardiyo egzersizleri',
  },
  {
    id: 'wellness',
    name: 'Wellness',
    icon: '🧘',
    color: '#a855f7',
    description: 'Meditasyon, nefes ve zihin egzersizleri',
  },
  {
    id: 'fitness',
    name: 'Fitness',
    icon: '💪',
    color: '#ef4444',
    description: 'Ağırlık antrenmanı ve vücut geliştirme',
  },
  {
    id: 'reading',
    name: 'Kitap Okuma',
    icon: '📚',
    color: '#eab308',
    description: 'Günlük kitap okuma alışkanlığı',
  },
  {
    id: 'language',
    name: 'Dil Öğrenme',
    icon: '🌍',
    color: '#3b82f6',
    description: 'Yabancı dil öğrenme ve pratik',
  },
  {
    id: 'education',
    name: 'Online Eğitim',
    icon: '💻',
    color: '#6366f1',
    description: 'Online kurslar ve dijital öğrenme',
  },
];

export const getCategoryById = (id: string) =>
  CATEGORIES.find((c) => c.id === id);
