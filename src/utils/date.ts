/**
 * Date and time helper utilities aligned with Indian Standard Time (IST)
 */

export function formatDateTime(isoString?: string): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

export function formatDate(isoString?: string): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

export function formatTime(isoString?: string): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

export function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

export function isSameDay(isoString1: string, isoString2: string): boolean {
  try {
    return isoString1.split('T')[0] === isoString2.split('T')[0];
  } catch {
    return false;
  }
}

export function isWithinDateRange(isoString: string, startDate?: string, endDate?: string): boolean {
  if (!startDate && !endDate) return true;
  const dateStr = isoString.split('T')[0];
  if (startDate && dateStr < startDate) return false;
  if (endDate && dateStr > endDate) return false;
  return true;
}

export function getRelativeTimeString(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return formatDate(isoString);
  }
}

export function timeStringToMinutes(timeStr?: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function minutesToTimeString(minutes: number): string {
  const norm = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60);
  const m = norm % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export interface MealScheduleValidationResult {
  isValid: boolean;
  error?: string;
  field?: 'morning' | 'afternoon' | 'evening';
}

/**
 * Validates that meal sessions do not overlap and follow strict sequence:
 * e.g., if Morning ends at 11:30, Afternoon must start at 11:31 or later.
 * If Afternoon ends at 16:30, Evening must start at 16:31 or later.
 */
export function validateMealScheduleTimings(schedule: {
  morning: { startTime: string; endTime: string };
  afternoon: { startTime: string; endTime: string };
  evening: { startTime: string; endTime: string };
}): MealScheduleValidationResult {
  const mStart = timeStringToMinutes(schedule.morning.startTime);
  const mEnd = timeStringToMinutes(schedule.morning.endTime);
  const aStart = timeStringToMinutes(schedule.afternoon.startTime);
  const aEnd = timeStringToMinutes(schedule.afternoon.endTime);
  const eStart = timeStringToMinutes(schedule.evening.startTime);
  const eEnd = timeStringToMinutes(schedule.evening.endTime);

  if (mStart >= mEnd) {
    return {
      isValid: false,
      field: 'morning',
      error: `Morning timing error: Start time (${schedule.morning.startTime}) must be strictly earlier than End time (${schedule.morning.endTime}).`,
    };
  }

  // Afternoon must start AFTER morning ends (at least +1 minute apart)
  if (aStart <= mEnd) {
    const requiredMin = minutesToTimeString(mEnd + 1);
    return {
      isValid: false,
      field: 'afternoon',
      error: `Timing Mismatch: Morning session ends at ${schedule.morning.endTime}, but Afternoon is scheduled at ${schedule.afternoon.startTime}. Afternoon must start at ${requiredMin} or later (no same-minute or overlapping shifts).`,
    };
  }

  if (aStart >= aEnd) {
    return {
      isValid: false,
      field: 'afternoon',
      error: `Afternoon timing error: Start time (${schedule.afternoon.startTime}) must be strictly earlier than End time (${schedule.afternoon.endTime}).`,
    };
  }

  // Evening must start AFTER afternoon ends (at least +1 minute apart)
  if (eStart <= aEnd) {
    const requiredMin = minutesToTimeString(aEnd + 1);
    return {
      isValid: false,
      field: 'evening',
      error: `Timing Mismatch: Afternoon session ends at ${schedule.afternoon.endTime}, but Evening is scheduled at ${schedule.evening.startTime}. Evening must start at ${requiredMin} or later (no same-minute or overlapping shifts).`,
    };
  }

  if (eStart >= eEnd) {
    return {
      isValid: false,
      field: 'evening',
      error: `Evening timing error: Start time (${schedule.evening.startTime}) must be strictly earlier than End time (${schedule.evening.endTime}).`,
    };
  }

  return { isValid: true };
}

/**
 * Automatically adjusts non-overlapping meal session times:
 * Morning: mStart to mEnd (default 06:30 - 11:30)
 * Afternoon: mEnd + 1m to 16:30 (e.g. 11:31 - 16:30)
 * Evening: aEnd + 1m to 22:30 (e.g. 16:31 - 22:30)
 */
export function autoAlignMealScheduleTimings<T extends {
  morning: { startTime: string; endTime: string };
  afternoon: { startTime: string; endTime: string };
  evening: { startTime: string; endTime: string };
}>(schedule: T): T {
  const mStart = schedule.morning.startTime || '06:30';
  const mEnd = schedule.morning.endTime || '11:30';
  const mEndMins = timeStringToMinutes(mEnd);

  // Afternoon starts at mEnd + 1 minute (e.g. 11:31)
  const aStartMins = mEndMins + 1;
  const aStart = minutesToTimeString(aStartMins);

  let aEndMins = timeStringToMinutes(schedule.afternoon.endTime);
  if (aEndMins <= aStartMins) {
    aEndMins = Math.min(aStartMins + 300, 1020); // 17:00
  }
  const aEnd = minutesToTimeString(aEndMins);

  // Evening starts at aEnd + 1 minute (e.g. 16:31)
  const eStartMins = timeStringToMinutes(aEnd) + 1;
  const eStart = minutesToTimeString(eStartMins);

  let eEndMins = timeStringToMinutes(schedule.evening.endTime);
  if (eEndMins <= eStartMins) {
    eEndMins = Math.min(eStartMins + 360, 1380); // 23:00
  }
  const eEnd = minutesToTimeString(eEndMins);

  return {
    ...schedule,
    morning: { ...schedule.morning, startTime: mStart, endTime: mEnd },
    afternoon: { ...schedule.afternoon, startTime: aStart, endTime: aEnd },
    evening: { ...schedule.evening, startTime: eStart, endTime: eEnd },
  };
}
