'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Store, X,
  LayoutDashboard, ShoppingCart, Package, Warehouse, Users,
  Tag, CreditCard, RotateCcw, Truck, TrendingUp, FileBarChart,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/sales', label: 'Penjualan', icon: ShoppingCart },
  { href: '/dashboard/products', label: 'Produk', icon: Package },
  { href: '/dashboard/inventory', label: 'Inventori', icon: Warehouse },
  { href: '/dashboard/customers', label: 'Pelanggan', icon: Users },
  { href: '/dashboard/promotions', label: 'Promosi', icon: Tag },
  { href: '/dashboard/payments', label: 'Pembayaran', icon: CreditCard },
  { href: '/dashboard/returns', label: 'Retur', icon: RotateCcw },
  { href: '/dashboard/suppliers', label: 'Supplier', icon: Truck },
  { href: '/dashboard/finance', label: 'Keuangan', icon: TrendingUp },
  { href: '/dashboard/reports', label: 'Laporan', icon: FileBarChart },
]

export function MobileSidebar() {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden p-2 rounded-md text-fm-muted hover:bg-slate-100"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          {/* Panel */}
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-fm-navy flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-fm-primary">
                  <Store className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">FamilyMart</p>
                  <p className="text-white/50 text-xs">Sales Dashboard</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 text-white/50 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const isActive =
                  href === '/dashboard' ? pathname === href : pathname.startsWith(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                      isActive
                        ? 'bg-fm-primary text-white'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                )
              })}
            </nav>
          </aside>
        </div>
      )}
    </>
  )
}
