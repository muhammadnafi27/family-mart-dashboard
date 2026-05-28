'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ShoppingCart, Package, Warehouse, Users,
  Tag, CreditCard, RotateCcw, Truck, TrendingUp, FileBarChart,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
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

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-[220px] min-h-screen bg-[#0F172A] shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div
          className="flex items-center justify-center h-8 w-8 rounded-lg shrink-0"
          style={{ background: 'linear-gradient(135deg,#0878C8,#37B220)' }}
        >
          <span className="text-white font-extrabold text-sm">FM</span>
        </div>
        <div className="min-w-0">
          <p className="text-white font-bold text-sm leading-tight">FamilyMart</p>
          <p className="text-white/40 text-[10px] font-medium">Sales Dashboard</p>
        </div>
      </div>

      <div className="mx-4 h-px bg-white/10 mb-3" />

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto pb-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              )}
            >
              {/* Active indicator */}
              <div
                className={cn(
                  'h-5 w-0.5 rounded-full transition-all',
                  isActive ? 'bg-gradient-to-b from-[#0878C8] to-[#37B220]' : 'bg-transparent'
                )}
              />
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-colors',
                  isActive ? 'text-[#0878C8]' : 'text-white/40 group-hover:text-white/60'
                )}
              />
              <span className="truncate">{label}</span>
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#37B220]" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="mx-4 h-px bg-white/10 mb-3" />
      <div className="px-4 pb-5">
        <div className="rounded-xl bg-white/5 px-3 py-3">
          <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-1">Versi</p>
          <p className="text-xs font-bold text-white/60">v1.0.0 · 2025</p>
        </div>
      </div>
    </aside>
  )
}
