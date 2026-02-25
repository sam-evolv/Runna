import {
  format,
  formatDistanceToNow,
  addDays,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isToday,
  isTomorrow,
  isYesterday,
  differenceInDays,
  differenceInWeeks,
  parseISO,
  addWeeks,
} from 'date-fns';

export {
  addDays,
  addWeeks,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isToday,
  isTomorrow,
  isYesterday,
  differenceInDays,
  differenceInWeeks,
  parseISO,
};

/**
 * Format date for display. Handles "Today", "Tomorrow", "Yesterday" etc.
 */
export function formatDate(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'EEE, d MMM');
}

/**
 * Format date as relative time (e.g., "3 days ago").
 */
export function formatRelative(dateStr: string): string {
  return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
}

/**
 * Format date for plan header (e.g., "Week of 3 Feb").
 */
export function formatWeekHeader(dateStr: string): string {
  const date = parseISO(dateStr);
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  return `Week of ${format(weekStart, 'd MMM')}`;
}

/**
 * Get day name from day number (1=Mon, 7=Sun).
 */
export function dayName(dayOfWeek: number): string {
  const names = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return names[dayOfWeek] || '';
}

/**
 * Get full day name from day number.
 */
export function dayNameFull(dayOfWeek: number): string {
  const names = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return names[dayOfWeek] || '';
}

/**
 * Format scheduled date for workout cards.
 */
export function formatScheduledDate(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';

  const daysAway = differenceInDays(date, new Date());
  if (daysAway > 0 && daysAway <= 6) {
    return format(date, 'EEEE'); // "Wednesday"
  }
  return format(date, 'EEE, d MMM'); // "Wed, 3 Feb"
}

/**
 * Generate dates for a week starting from a given date.
 */
export function getWeekDates(weekStartDate: string): Date[] {
  const start = startOfWeek(parseISO(weekStartDate), { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/**
 * Calculate weeks until a target date.
 */
export function weeksUntil(targetDate: string): number {
  return differenceInWeeks(parseISO(targetDate), new Date());
}
