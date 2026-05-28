'use client'

import { Bell, Search, UserCircle, ChevronDown } from 'lucide-react'
import { MobileSidebar } from './MobileSidebar'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { useFilterStore } from '@/store/filterStore'

type HeaderProps = {
  title: string
}

export function Header({ title }: HeaderProps) {
  const { from, to, setDateRange } = useFilterStore()

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-[0_1px_0_0_#E2E8F0]">
      <div className="flex items-center justify-between h-14 px-4 md:px-6 gap-3">

        {/* Left – mobile menu + breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <MobileSidebar />
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs text-[#94A3B8] hidden sm:inline">Dashboard</span>
            <span className="text-xs text-[#CBD5E1] hidden sm:inline">/</span>
            <h1 className="text-sm font-bold text-[#0F172A] truncate">{title}</h1>
          </div>
        </div>

        {/* Center – search */}
        <div className="hidden md:flex flex-1 max-w-xs">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Cari produk, toko, invoice..."
              className="w-full h-8 pl-8 pr-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#0878C8] focus:ring-2 focus:ring-[#0878C8]/20 transition-all"
            />
          </div>
        </div>

        {/* Right – date picker + notifications + profile */}
        <div className="flex items-center gap-2">
          {/* Date picker (desktop) */}
          <div className="hidden lg:block">
            <DateRangePicker from={from} to={to} onChange={setDateRange} />
          </div>

          {/* Notification bell */}
          <button className="relative flex items-center justify-center h-8 w-8 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] transition-colors">
            <Bell className="h-4 w-4 text-[#64748B]" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#EF4444]" />
          </button>

          {/* Profile button */}
          <button className="flex items-center gap-2 h-8 rounded-lg border border-[#E2E8F0] bg-white px-2.5 hover:bg-[#F8FAFC] transition-colors">
            <div className="h-5 w-5 rounded-full bg-gradient-to-br from-[#0878C8] to-[#37B220] flex items-center justify-center">
              <span className="text-[9px] font-bold text-white">A</span>
            </div>
            <span className="hidden md:block text-xs font-semibold text-[#0F172A]">Admin</span>
            <ChevronDown className="hidden md:block h-3 w-3 text-[#94A3B8]" />
          </button>
        </div>
      </div>
    </header>
  )
}
