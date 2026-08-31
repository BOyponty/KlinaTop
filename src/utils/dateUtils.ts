/**
 * Date utility functions for KlinaTop
 * Handles dynamic current date, navigation between days, and French formatting.
 */

export function getTodayISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseISODate(isoStr: string): Date {
  const parts = (isoStr || getTodayISO()).split('-');
  const year = parseInt(parts[0], 10) || new Date().getFullYear();
  const month = (parseInt(parts[1], 10) || 1) - 1;
  const day = parseInt(parts[2], 10) || 1;
  return new Date(year, month, day, 12, 0, 0);
}

export function isToday(isoStr: string): boolean {
  return isoStr === getTodayISO();
}

export function isYesterday(isoStr: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isoStr === formatDateToISO(yesterday);
}

export function isFuture(isoStr: string): boolean {
  return isoStr > getTodayISO();
}

export function addDays(isoStr: string, amount: number): string {
  const date = parseISODate(isoStr);
  date.setDate(date.getDate() + amount);
  return formatDateToISO(date);
}

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const DAYS_FR = [
  'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
];

export function formatFullFrenchDate(isoStr: string): string {
  const date = parseISODate(isoStr);
  const dayNum = date.getDate();
  const monthName = MONTHS_FR[date.getMonth()] || '';
  const year = date.getFullYear();
  const dayName = DAYS_FR[date.getDay()] || '';

  if (isToday(isoStr)) {
    return `Aujourd'hui, ${dayNum} ${monthName} ${year}`;
  }
  if (isYesterday(isoStr)) {
    return `Hier, ${dayNum} ${monthName} ${year}`;
  }
  return `${dayName} ${dayNum} ${monthName} ${year}`;
}

export function formatShortDate(isoStr: string): string {
  const date = parseISODate(isoStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
