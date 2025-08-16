import dayjs, { Dayjs } from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';

dayjs.extend(isToday);
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(utc);

// Helper to parse input to Day.js object
export const parse = (date: Date | string) => dayjs(date);

export const parseDate = (date: Date | string) => parse(date);

/**
 * Format a date to a specific format
 */
export const formatDate = ({
  date,
  formatStr = 'YYYY-MM-DD',
  withTime = true,
  toISOString = true,
}: {
  date: Date | string;
  formatStr?: string;
  withTime?: boolean;
  toISOString?: boolean;
}): string => {
  let d = parse(date);

  const hasTime = d.hour() !== 0 || d.minute() !== 0 || d.second() !== 0;
  const finalFormat = withTime && hasTime ? `${formatStr} HH:mm:ss` : formatStr;

  if (withTime && !hasTime) {
    const now = dayjs();
    d = d.hour(now.hour()).minute(now.minute()).second(now.second());
  }

  return toISOString ? d.toISOString() : d.format(finalFormat);
};

/**
 * Get current date as Date or Dayjs object
 */
export function now(asDate: true): Date;
export function now(asDate?: false): Dayjs;
export function now(asDate?: boolean): Dayjs | Date {
  return asDate ? dayjs().toDate() : dayjs();
}
