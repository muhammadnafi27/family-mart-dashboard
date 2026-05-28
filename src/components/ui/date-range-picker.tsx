'use client'

import * as React from 'react'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import type { DateRange } from 'react-day-picker'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { cn } from '@/lib/utils'
import { Button } from './button'

type DateRangePickerProps = {
  from?: Date
  to?: Date
  onChange: (from: Date | undefined, to: Date | undefined) => void
  className?: string
}

export function DateRangePicker({ from, to, onChange, className }: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)

  const selected: DateRange | undefined =
    from || to ? { from, to } : undefined

  const label =
    from && to
      ? `${format(from, 'd MMM yyyy', { locale: id })} – ${format(to, 'd MMM yyyy', { locale: id })}`
      : from
        ? format(from, 'd MMM yyyy', { locale: id })
        : 'Pilih periode'

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <Button
          variant="outline"
          className={cn('h-9 min-w-[220px] justify-start gap-2 text-sm font-normal', className)}
        >
          <CalendarIcon className="h-4 w-4 text-fm-primary shrink-0" />
          <span className={cn(!from && !to && 'text-fm-muted')}>{label}</span>
        </Button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          className="z-50 mt-1 rounded-xl border border-fm-border bg-fm-card p-3 shadow-lg"
          sideOffset={4}
        >
          <DayPicker
            mode="range"
            selected={selected}
            onSelect={(range) => {
              onChange(range?.from, range?.to)
              if (range?.from && range?.to) setOpen(false)
            }}
            locale={id}
            numberOfMonths={2}
            className="text-sm"
          />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
