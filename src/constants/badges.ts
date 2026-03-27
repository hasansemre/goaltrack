import type { Badge, CategoryId } from '@/types';

// ─── Yardımcı: tek kategori için 11 rozet üretir ───────────────────────────
function catBadges(
  prefix: string,
  catId: CategoryId,
  icons: {
    day1: string; day3: string;
    s7: string; s14: string; s30: string; s90: string; s365: string;
    h5: string; h25: string; h100: string; h500: string;
  },
  names: {
    day1: string; day3: string;
    s7: string; s14: string; s30: string; s90: string; s365: string;
    h5: string; h25: string; h100: string; h500: string;
  }
): Badge[] {
  return [
    {
      id: `${prefix}_day1`, categoryId: catId, name: names.day1,
      description: 'İlk aktiviteyi tamamla', icon: icons.day1, tier: 'bronze',
      condition: { type: 'total_days', categoryId: catId, value: 1 },
    },
    {
      id: `${prefix}_day3`, categoryId: catId, name: names.day3,
      description: '3 farklı günde aktivite yap', icon: icons.day3, tier: 'bronze',
      condition: { type: 'total_days', categoryId: catId, value: 3 },
    },
    {
      id: `${prefix}_streak7`, categoryId: catId, name: names.s7,
      description: '7 gün üst üste aktivite', icon: icons.s7, tier: 'silver',
      condition: { type: 'streak', categoryId: catId, value: 7 },
    },
    {
      id: `${prefix}_streak14`, categoryId: catId, name: names.s14,
      description: '14 gün üst üste aktivite', icon: icons.s14, tier: 'silver',
      condition: { type: 'streak', categoryId: catId, value: 14 },
    },
    {
      id: `${prefix}_streak30`, categoryId: catId, name: names.s30,
      description: '30 gün üst üste aktivite', icon: icons.s30, tier: 'gold',
      condition: { type: 'streak', categoryId: catId, value: 30 },
    },
    {
      id: `${prefix}_streak90`, categoryId: catId, name: names.s90,
      description: '90 gün üst üste aktivite', icon: icons.s90, tier: 'gold',
      condition: { type: 'streak', categoryId: catId, value: 90 },
    },
    {
      id: `${prefix}_streak365`, categoryId: catId, name: names.s365,
      description: '365 gün üst üste aktivite — efsanevi!', icon: icons.s365, tier: 'platinum',
      condition: { type: 'streak', categoryId: catId, value: 365 },
    },
    {
      id: `${prefix}_5h`, categoryId: catId, name: names.h5,
      description: 'Toplam 5 saat', icon: icons.h5, tier: 'bronze',
      condition: { type: 'total_hours', categoryId: catId, value: 5 },
    },
    {
      id: `${prefix}_25h`, categoryId: catId, name: names.h25,
      description: 'Toplam 25 saat', icon: icons.h25, tier: 'silver',
      condition: { type: 'total_hours', categoryId: catId, value: 25 },
    },
    {
      id: `${prefix}_100h`, categoryId: catId, name: names.h100,
      description: 'Toplam 100 saat', icon: icons.h100, tier: 'gold',
      condition: { type: 'total_hours', categoryId: catId, value: 100 },
    },
    {
      id: `${prefix}_500h`, categoryId: catId, name: names.h500,
      description: 'Toplam 500 saat — efsanevi!', icon: icons.h500, tier: 'platinum',
      condition: { type: 'total_hours', categoryId: catId, value: 500 },
    },
  ];
}

// ─── Yürüyüş ──────────────────────────────────────────────────────────────
const walkingBadges = catBadges('walk', 'walking',
  { day1:'👟', day3:'🚶', s7:'🔥', s14:'🛤️', s30:'👠', s90:'🏅', s365:'💎',
    h5:'⏱️', h25:'🗺️', h100:'🌍', h500:'🌐' },
  { day1:'İlk Adım', day3:'Yürüyüş Başlangıcı', s7:'Yürüyüş Alışkanlığı',
    s14:'İki Hafta Tam', s30:'Aylık Yürüyüşçü', s90:'Mevsimlik Şampiyon',
    s365:'Yürüyüş Efsanesi', h5:'5 Saat Tamamlandı', h25:'Yürüyüş Tutkunluğu',
    h100:'Yüz Saatlik Yürüyüş', h500:'Kıtalararası Yürüyüşçü' }
);

// ─── Kardiyo ──────────────────────────────────────────────────────────────
const cardioBadges = catBadges('cardio', 'cardio',
  { day1:'❤️', day3:'💓', s7:'💨', s14:'🏃', s30:'⚙️', s90:'🫀', s365:'👑',
    h5:'⚡', h25:'🔋', h100:'🌡️', h500:'🦾' },
  { day1:'Kalp Atışı', day3:'Kardiyo Başlangıcı', s7:'Nefes Nefese',
    s14:'İki Hafta Kardiyo', s30:'Kardiyo Makinesi', s90:'Kardiyo Şampiyonu',
    s365:'Kardiyo Efsanesi', h5:'Isınma Tamamlandı', h25:'Kardiyo Tutkunu',
    h100:'Yüz Saatlik Kardiyo', h500:'Kardiyovasküler Efsane' }
);

// ─── Wellness ─────────────────────────────────────────────────────────────
const wellnessBadges = catBadges('well', 'wellness',
  { day1:'🌸', day3:'🌿', s7:'☯️', s14:'🧘', s30:'🔮', s90:'🪷', s365:'✨',
    h5:'🕊️', h25:'🌙', h100:'💫', h500:'🌟' },
  { day1:'İç Huzur', day3:'Wellness Başlangıcı', s7:'Zihin Dinginliği',
    s14:'İki Hafta Huzur', s30:'Alışkanlık Ustası', s90:'Denge Şampiyonu',
    s365:'Zen Efsanesi', h5:'Beş Saat Huzur', h25:'Wellness Tutkunu',
    h100:'Yüz Saatlik Huzur', h500:'Ruh Rehberi' }
);

// ─── Fitness ──────────────────────────────────────────────────────────────
const fitnessBadges = catBadges('fit', 'fitness',
  { day1:'🏋️', day3:'💪', s7:'🔩', s14:'⛏️', s30:'🥈', s90:'🥇', s365:'⚡',
    h5:'🏃', h25:'🦴', h100:'💪', h500:'🏛️' },
  { day1:'İlk Ter', day3:'Fitness Başlangıcı', s7:'Demir İrade',
    s14:'İki Hafta Antrenman', s30:'Çelik Kaslar', s90:'Vücut Geliştirici',
    s365:'Fitness Efsanesi', h5:'Beş Saat Ter', h25:'Fitness Tutkunu',
    h100:'Yüz Saatlik Güç', h500:'Olympos\'a Ulaştın' }
);

// ─── Kitap Okuma ──────────────────────────────────────────────────────────
const readingBadges = catBadges('read', 'reading',
  { day1:'📖', day3:'📚', s7:'🔖', s14:'📝', s30:'🗞️', s90:'📘', s365:'📜',
    h5:'🖊️', h25:'📓', h100:'🎓', h500:'🏛️' },
  { day1:'İlk Sayfa', day3:'Okuma Başlangıcı', s7:'Hevesli Okuyucu',
    s14:'İki Hafta Okuma', s30:'Kütüphane Kurdu', s90:'Okuma Şampiyonu',
    s365:'Sözcük Sultanı', h5:'Beş Saat Okuma', h25:'Okuma Tutkunu',
    h100:'Yüz Saatlik Bilgelik', h500:'Büyük Kütüphaneci' }
);

// ─── Dil Öğrenme ──────────────────────────────────────────────────────────
const languageBadges = catBadges('lang', 'language',
  { day1:'💬', day3:'🗣️', s7:'🏳️', s14:'🌐', s30:'🗺️', s90:'🌍', s365:'💎',
    h5:'🔤', h25:'📡', h100:'🌐', h500:'👑' },
  { day1:'Merhaba Dünya', day3:'Dil Başlangıcı', s7:'Dil Meraklısı',
    s14:'İki Hafta Pratik', s30:'Çok Dilli Başlangıç', s90:'Dil Şampiyonu',
    s365:'Poliglot', h5:'Beş Saat Pratik', h25:'Dil Tutkunu',
    h100:'Dil Ustası', h500:'Büyükelçi' }
);

// ─── Online Eğitim ────────────────────────────────────────────────────────
const educationBadges = catBadges('edu', 'education',
  { day1:'🖥️', day3:'💡', s7:'📡', s14:'🔬', s30:'📜', s90:'🏅', s365:'🎓',
    h5:'⌨️', h25:'🛠️', h100:'💻', h500:'🧠' },
  { day1:'İlk Ders', day3:'Eğitim Başlangıcı', s7:'Öğrenmeye Aç',
    s14:'İki Hafta Eğitim', s30:'Dijital Öğrenci', s90:'Eğitim Şampiyonu',
    s365:'Ömür Boyu Öğrenci', h5:'Beş Saat Eğitim', h25:'Eğitim Tutkunu',
    h100:'Tech Ustası', h500:'Dijital Deha' }
);

// ─── Evrensel Rozetler ────────────────────────────────────────────────────
const universalBadges: Badge[] = [
  // İlk adım
  {
    id: 'uni_first_ever',
    name: 'Yolculuk Başladı',
    description: 'Hayat değiştiren ilk adımını at',
    icon: '🚀', tier: 'bronze',
    condition: { type: 'total_days', value: 1 },
  },
  // Aktif gün milestones
  {
    id: 'uni_days_10',
    name: '10 Aktif Gün',
    description: 'Toplam 10 farklı gün aktivite yap',
    icon: '📅', tier: 'bronze',
    condition: { type: 'total_days', value: 10 },
  },
  {
    id: 'uni_days_30',
    name: '30 Aktif Gün',
    description: 'Toplam 30 farklı gün aktivite yap',
    icon: '🗓️', tier: 'silver',
    condition: { type: 'total_days', value: 30 },
  },
  {
    id: 'uni_days_100',
    name: '100 Aktif Gün',
    description: 'Toplam 100 farklı gün aktivite yap',
    icon: '💯', tier: 'gold',
    condition: { type: 'total_days', value: 100 },
  },
  {
    id: 'uni_days_365',
    name: 'Bir Yıl Aktif',
    description: '365 farklı gün aktivite yap',
    icon: '🏆', tier: 'platinum',
    condition: { type: 'total_days', value: 365 },
  },
  // Streak milestones (genel)
  {
    id: 'uni_streak_3',
    name: '3 Gün Serisi',
    description: 'Herhangi bir hedefte 3 gün üst üste',
    icon: '🔥', tier: 'bronze',
    condition: { type: 'streak', value: 3 },
  },
  {
    id: 'uni_streak_7',
    name: '7 Gün Serisi',
    description: 'Herhangi bir hedefte 7 gün üst üste',
    icon: '⚡', tier: 'bronze',
    condition: { type: 'streak', value: 7 },
  },
  {
    id: 'uni_streak_14',
    name: '14 Gün Serisi',
    description: 'Herhangi bir hedefte 14 gün üst üste',
    icon: '🌊', tier: 'silver',
    condition: { type: 'streak', value: 14 },
  },
  {
    id: 'uni_streak_30',
    name: '30 Gün Savaşçısı',
    description: 'Herhangi bir hedefte 30 gün üst üste',
    icon: '🛡️', tier: 'silver',
    condition: { type: 'streak', value: 30 },
  },
  {
    id: 'uni_streak_60',
    name: '60 Gün Azmi',
    description: 'Herhangi bir hedefte 60 gün üst üste',
    icon: '⚔️', tier: 'gold',
    condition: { type: 'streak', value: 60 },
  },
  {
    id: 'uni_streak_100',
    name: '100 Gün Efsanesi',
    description: 'Herhangi bir hedefte 100 gün üst üste',
    icon: '🔱', tier: 'gold',
    condition: { type: 'streak', value: 100 },
  },
  {
    id: 'uni_streak_180',
    name: '6 Ay Durdurulamaz',
    description: 'Herhangi bir hedefte 180 gün üst üste',
    icon: '🌠', tier: 'platinum',
    condition: { type: 'streak', value: 180 },
  },
  {
    id: 'uni_streak_365',
    name: 'Bir Yıl Kesilmez',
    description: 'Herhangi bir hedefte 365 gün üst üste',
    icon: '👑', tier: 'platinum',
    condition: { type: 'streak', value: 365 },
  },
  // Toplam saat milestones (tüm kategoriler)
  {
    id: 'uni_10h',
    name: '10 Saatlik Yatırım',
    description: 'Tüm hedeflerde toplam 10 saat',
    icon: '⏰', tier: 'bronze',
    condition: { type: 'total_hours', value: 10 },
  },
  {
    id: 'uni_50h',
    name: '50 Saatlik Yatırım',
    description: 'Tüm hedeflerde toplam 50 saat',
    icon: '⌚', tier: 'silver',
    condition: { type: 'total_hours', value: 50 },
  },
  {
    id: 'uni_200h',
    name: '200 Saatlik Yatırım',
    description: 'Tüm hedeflerde toplam 200 saat',
    icon: '🕰️', tier: 'gold',
    condition: { type: 'total_hours', value: 200 },
  },
  {
    id: 'uni_500h',
    name: '500 Saatlik Yatırım',
    description: 'Tüm hedeflerde toplam 500 saat',
    icon: '⏳', tier: 'gold',
    condition: { type: 'total_hours', value: 500 },
  },
  {
    id: 'uni_1000h',
    name: 'Bin Saatlik Usta',
    description: 'Tüm hedeflerde toplam 1000 saat — sınıf atlıyorsun!',
    icon: '🌟', tier: 'platinum',
    condition: { type: 'total_hours', value: 1000 },
  },
  // Tüm kategorileri kullanma
  {
    id: 'uni_3cat',
    name: 'Çok Yönlü Başlangıç',
    description: '3 farklı kategoride aktivite yap',
    icon: '🎯', tier: 'bronze',
    condition: { type: 'total_categories_used', value: 3 },
  },
  {
    id: 'uni_5cat',
    name: 'Dengeli Yaşam',
    description: '5 farklı kategoride aktivite yap',
    icon: '🌈', tier: 'silver',
    condition: { type: 'total_categories_used', value: 5 },
  },
  {
    id: 'uni_7cat',
    name: 'Her Yönlü Şampiyon',
    description: 'Tüm 7 kategoride aktivite yap',
    icon: '💎', tier: 'gold',
    condition: { type: 'total_categories_used', value: 7 },
  },
  // Tamamlama oranı
  {
    id: 'uni_rate_week',
    name: 'Mükemmel Hafta',
    description: 'Bir haftada tüm günlük hedefleri tamamla',
    icon: '✅', tier: 'gold',
    condition: { type: 'completion_rate', value: 100, period: 'weekly' },
  },
  {
    id: 'uni_rate_month',
    name: 'Mükemmel Ay',
    description: 'Bir ayda %90+ tamamlama oranı',
    icon: '🥇', tier: 'platinum',
    condition: { type: 'completion_rate', value: 90, period: 'monthly' },
  },
];

// ─── Tüm rozetler ─────────────────────────────────────────────────────────
export const BADGES: Badge[] = [
  ...walkingBadges,
  ...cardioBadges,
  ...wellnessBadges,
  ...fitnessBadges,
  ...readingBadges,
  ...languageBadges,
  ...educationBadges,
  ...universalBadges,
];

export const getBadgeById = (id: string) => BADGES.find((b) => b.id === id);
export const getBadgesByCategory = (categoryId: string) =>
  BADGES.filter((b) => b.categoryId === categoryId);
