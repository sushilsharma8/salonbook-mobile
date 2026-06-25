import { format } from 'date-fns';

function toDate(value: string | Date): Date {
  return typeof value === 'string' ? new Date(value) : value;
}

export function bookingTimeMs(value: string | Date): number {
  const d = toDate(value);
  return Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
    d.getUTCHours(),
    d.getUTCMinutes(),
    d.getUTCSeconds(),
  );
}

export function nowBookingTimeMs(): number {
  const now = new Date();
  return Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
  );
}

export function isBookingUpcoming(value: string | Date): boolean {
  return bookingTimeMs(value) > nowBookingTimeMs();
}

/** PENDING bookings sellers can still accept or reject. */
export function isPendingBookingActionable(booking: {
  startTime: string | Date;
  status: string;
}): boolean {
  return booking.status === 'PENDING' && isBookingUpcoming(booking.startTime);
}

export function formatBookingTime(value: string | Date, pattern: string): string {
  const d = toDate(value);
  const wallClock = new Date(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
    d.getUTCHours(),
    d.getUTCMinutes(),
    d.getUTCSeconds(),
  );
  return format(wallClock, pattern);
}

export function buildBookingIso(date: Date, time: string): string {
  const dateStr = format(date, 'yyyy-MM-dd');
  return `${dateStr}T${time}:00.000Z`;
}
