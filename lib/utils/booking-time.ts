export const VN_TIMEZONE = 'Asia/Ho_Chi_Minh';

type VnClock = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

function getVnClock(date = new Date()): VnClock {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: VN_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  ) as Record<string, string>;

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

export function parseTimeToMinutes(time: string): number {
  const normalized = time.trim();
  const match = normalized.match(/T(\d{2}):(\d{2})/) ?? normalized.match(/^(\d{2}):(\d{2})/);
  if (!match) return Number.NaN;
  return Number(match[1]) * 60 + Number(match[2]);
}

function parseDateKey(dateStr: string): number {
  const [year, month, day] = dateStr.slice(0, 10).split('-').map(Number);
  return year * 10000 + month * 100 + day;
}

function toDateKey(clock: Pick<VnClock, 'year' | 'month' | 'day'>): number {
  return clock.year * 10000 + clock.month * 100 + clock.day;
}

export function isDateBeforeTodayVn(dateStr: string, now = new Date()): boolean {
  return parseDateKey(dateStr) < toDateKey(getVnClock(now));
}

export function isSlotStartInPast(dateStr: string, startTime: string, now = new Date()): boolean {
  if (isDateBeforeTodayVn(dateStr, now)) return true;

  const slotDateKey = parseDateKey(dateStr);
  const nowDateKey = toDateKey(getVnClock(now));
  if (slotDateKey > nowDateKey) return false;

  const startMinutes = parseTimeToMinutes(startTime);
  if (Number.isNaN(startMinutes)) return false;

  const { hour, minute } = getVnClock(now);
  return startMinutes < hour * 60 + minute;
}

export function todayIsoDateVn(now = new Date()): string {
  const { year, month, day } = getVnClock(now);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const WEEKDAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'] as const;

export function next7DaysVn() {
  const now = new Date();
  const days = [];

  for (let i = 0; i < 7; i += 1) {
    const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const { year, month, day } = getVnClock(date);
    const value = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const weekdayIndex = new Date(`${value}T12:00:00+07:00`).getUTCDay();

    days.push({
      value,
      weekday: WEEKDAY_LABELS[weekdayIndex],
      dayMonth: `${day}/${month}`,
      isToday: i === 0,
    });
  }

  return days;
}

export function isSlotSelectable(
  dateStr: string,
  slot: { startTime: string; status: 'available' | 'booked' | 'past' },
  now = new Date(),
): boolean {
  if (slot.status === 'booked' || slot.status === 'past') return false;
  return !isSlotStartInPast(dateStr, slot.startTime, now);
}
