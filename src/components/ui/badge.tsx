import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-fm-primary text-white',
        secondary: 'border-transparent bg-slate-100 text-fm-muted',
        success: 'border-transparent bg-fm-soft-green text-fm-green',
        destructive: 'border-transparent bg-red-100 text-fm-red',
        warning: 'border-transparent bg-orange-100 text-fm-orange',
        outline: 'border-fm-border text-fm-muted',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
