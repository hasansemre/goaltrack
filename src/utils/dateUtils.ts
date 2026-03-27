import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval } from 'date-fns';
import { tr } from 'date-fns/locale';

export const formatDate = (date: Date | string, fmt = 'yyyy-MM-dd') =>
  format(typeof date === 'string' ? new Date(date) : date, fmt);

export const today = () => format(new Date(), 'yyyy-MM-dd');

export const todayDisplay = () =>
  format(new Date(), 'd MMMM yyyy', { locale: tr });

export const last7Days = () =>
  Array.from({ length: 7 }, (_, i) =>
    format(subDays(new Date(), 6 - i), 'yyyy-MM-dd')
  );

export const last30Days = () =>
  Array.from({ length: 30 }, (_, i) =>
    format(subDays(new Date(), 29 - i), 'yyyy-MM-dd')
  );

export const currentWeekDays = () => {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Pazartesi
  const end = endOfWeek(new Date(), { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end }).map((d) => format(d, 'yyyy-MM-dd'));
};

export const getWeekRange = () => ({
  start: format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
  end: format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
});

export const getMonthRange = () => ({
  start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
  end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
});

export const getYearRange = () => ({
  start: format(startOfYear(new Date()), 'yyyy-MM-dd'),
  end: format(endOfYear(new Date()), 'yyyy-MM-dd'),
});

export const shortDayName = (dateStr: string) =>
  format(new Date(dateStr), 'EEE', { locale: tr });
