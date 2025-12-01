export const MONTHS: Record<number, string> = {
  0: 'Jan',
  1: 'Feb',
  2: 'Mar',
  3: 'Apr',
  4: 'May',
  5: 'Jun',
  6: 'Jul',
  7: 'Aug',
  8: 'Sep',
  9: 'Oct',
  10: 'Nov',
  11: 'Dec',
};

export const WEEKDAYS: Record<number, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

export interface Date {
  year: number,
  month: string,
  day: number,
  weekday: string,
  hours: string,
  minutes: string,
  seconds: string,
}

export default function getDate(timestamp: number): Date {
  const date = new Date(timestamp);

  const year = date.getUTCFullYear();
  const month = MONTHS[date.getUTCMonth()];
  const day = date.getUTCDate();
  const weekday = WEEKDAYS[date.getUTCDay()];

  let hours = String(date.getUTCHours());
  let minutes = String(date.getUTCMinutes());
  let seconds = String(date.getUTCSeconds());

  if (hours.length < 2) hours = `0${hours}`;
  if (minutes.length < 2) minutes = `0${minutes}`;
  if (seconds.length < 2) seconds = `0${seconds}`;

  return {
    year,
    month,
    day,
    weekday,
    hours,
    minutes,
    seconds,
  };
}
