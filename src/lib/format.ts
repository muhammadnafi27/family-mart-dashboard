import { format, parseISO, startOfDay, endOfDay } from 'date-fns'
import { id } from 'date-fns/locale'

export function formatDate(date: Date | string, fmt = 'dd MMM yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, fmt, { locale: id })
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd MMM yyyy, HH:mm', { locale: id })
}

export function toStartOfDay(date: Date): Date {
  return startOfDay(date)
}

export function toEndOfDay(date: Date): Date {
  return endOfDay(date)
}

export function toSqlDate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}
