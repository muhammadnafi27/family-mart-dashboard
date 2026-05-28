import * as React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ─────────────────── Skeleton ─────────────────── */
export function MetricCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2.5">
          <div className="h-3 w-20 rounded-full bg-slate-200" />
          <div className="h-7 w-32 rounded-md bg-slate-200" />
          <div className="h-3 w-16 rounded-full bg-slate-200" />
        </div>
        <div className="h-11 w-11 rounded-xl bg-slate-200 shrink-0" />
      </div>
    </div>
  )
}

/* ─────────────────── Props ─────────────────── */
type MetricCardProps = {
  title: string
  value: string
  subtitle?: string
  change?: number
  icon: React.ReactNode
  accentColor?: string
  bgColor?: string
  variant?: 'default' | 'danger' | 'success'
  loading?: boolean
}

/* ─────────────────── Component ─────────────────── */
export function MetricCard({
  title,
  value,
  subtitle,
  change,
  icon,
  accentColor = '#0878C8',
  bgColor,
  variant = 'default',
  loading = false,
}: MetricCardProps) {
  if (loading) return <MetricCardSkeleton />

  const iconBg = bgColor ?? `${accentColor}15`
  const changeDir =
    change === undefined ? null : change > 0 ? 'up' : change < 0 ? 'down' : 'flat'

  return (
    <div
      className={cn(
        'group relative rounded-2xl border bg-white p-5 transition-all duration-200',
        'hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5',
        variant === 'danger'
          ? 'border-red-100'
          : variant === 'success'
            ? 'border-green-100'
            : 'border-[#E2E8F0]'
      )}
    >
      {/* Colored left border accent */}
      <div
        className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full"
        style={{ background: accentColor }}
      />

      <div className="flex items-start justify-between gap-3 pl-2">
        {/* Text content */}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#64748B] truncate">
            {title}
          </p>

          <p
            className={cn(
              'mt-2 text-2xl font-extrabold leading-none tracking-tight truncate',
              variant === 'danger'
                ? 'text-[#EF4444]'
                : variant === 'success'
                  ? 'text-[#22C55E]'
                  : 'text-[#0F172A]'
            )}
          >
            {value}
          </p>

          {subtitle && (
            <p className="mt-1 text-xs text-[#64748B] truncate">{subtitle}</p>
          )}

          {changeDir && change !== undefined && (
            <div
              className={cn(
                'mt-2.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                changeDir === 'up' && 'bg-green-50 text-[#22C55E]',
                changeDir === 'down' && 'bg-red-50 text-[#EF4444]',
                changeDir === 'flat' && 'bg-slate-100 text-[#64748B]'
              )}
            >
              {changeDir === 'up' && <TrendingUp className="h-3 w-3" />}
              {changeDir === 'down' && <TrendingDown className="h-3 w-3" />}
              {changeDir === 'flat' && <Minus className="h-3 w-3" />}
              <span>{change > 0 ? '+' : ''}{change.toFixed(1)}% vs bulan lalu</span>
            </div>
          )}
        </div>

        {/* Icon bubble */}
        <div
          className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0 transition-transform duration-200 group-hover:scale-110"
          style={{ background: iconBg }}
        >
          <span style={{ color: accentColor }}>{icon}</span>
        </div>
      </div>
    </div>
  )
}
