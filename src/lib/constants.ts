export const FM_COLORS = {
  primary: '#0878C8',
  secondary: '#0B8BD3',
  green: '#37B220',
  softGreen: '#EAF8E7',
  bg: '#F8FAFC',
  card: '#FFFFFF',
  navy: '#0F172A',
  muted: '#64748B',
  red: '#EF4444',
  orange: '#F97316',
  success: '#22C55E',
  border: '#E2E8F0',
} as const

export const CHART_COLORS = [
  '#0878C8',
  '#37B220',
  '#F97316',
  '#8B5CF6',
  '#EC4899',
  '#0B8BD3',
  '#22C55E',
  '#EF4444',
  '#F59E0B',
  '#6366F1',
]

export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: 'LayoutDashboard' },
  { href: '/dashboard/sales', label: 'Penjualan', icon: 'ShoppingCart' },
  { href: '/dashboard/products', label: 'Produk', icon: 'Package' },
  { href: '/dashboard/inventory', label: 'Inventori', icon: 'Warehouse' },
  { href: '/dashboard/customers', label: 'Pelanggan', icon: 'Users' },
  { href: '/dashboard/promotions', label: 'Promosi', icon: 'Tag' },
  { href: '/dashboard/payments', label: 'Pembayaran', icon: 'CreditCard' },
  { href: '/dashboard/returns', label: 'Retur', icon: 'RotateCcw' },
  { href: '/dashboard/suppliers', label: 'Supplier', icon: 'Truck' },
  { href: '/dashboard/finance', label: 'Keuangan', icon: 'TrendingUp' },
  { href: '/dashboard/reports', label: 'Laporan', icon: 'FileBarChart' },
] as const

export const DEFAULT_DATE_RANGE = {
  from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  to: new Date(),
}
