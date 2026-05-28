'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/format'

export default function PromotionsPage() {
  const [page, setPage] = React.useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['promotions', page],
    queryFn: async () => {
      const res = await fetch(`/api/promotions?page=${page}`)
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
  })

  const promos = data?.data ?? []
  const today = new Date()

  return (
    <>
      <Header title="Promosi" />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Daftar Promosi</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="h-8 w-8 rounded-full border-2 border-fm-primary border-t-transparent animate-spin" />
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode</TableHead>
                      <TableHead>Nama Promosi</TableHead>
                      <TableHead>Tipe Diskon</TableHead>
                      <TableHead className="text-right">Nilai</TableHead>
                      <TableHead>Mulai</TableHead>
                      <TableHead>Berakhir</TableHead>
                      <TableHead className="text-right">Produk</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {promos.map((p: {
                      promotion_id: number
                      promo_code: string
                      promo_name: string
                      discount_type: string
                      discount_value: number
                      start_date: string
                      end_date: string
                      _count: { promotion_products: number }
                    }) => {
                      const isActive = new Date(p.start_date) <= today && today <= new Date(p.end_date)
                      const isExpired = new Date(p.end_date) < today
                      return (
                        <TableRow key={p.promotion_id}>
                          <TableCell className="font-mono text-xs text-fm-primary font-medium">{p.promo_code}</TableCell>
                          <TableCell className="text-sm font-medium max-w-[180px] truncate">{p.promo_name}</TableCell>
                          <TableCell className="text-xs text-fm-muted capitalize">{p.discount_type}</TableCell>
                          <TableCell className="text-right font-semibold text-fm-orange">
                            {p.discount_type === 'percent' ? `${p.discount_value}%` : `Rp${Number(p.discount_value).toLocaleString('id-ID')}`}
                          </TableCell>
                          <TableCell className="text-xs text-fm-muted whitespace-nowrap">{formatDate(p.start_date)}</TableCell>
                          <TableCell className="text-xs text-fm-muted whitespace-nowrap">{formatDate(p.end_date)}</TableCell>
                          <TableCell className="text-right text-xs">{p._count.promotion_products}</TableCell>
                          <TableCell>
                            {isExpired
                              ? <Badge variant="secondary">Berakhir</Badge>
                              : isActive
                                ? <Badge variant="success">Aktif</Badge>
                                : <Badge variant="outline">Mendatang</Badge>
                            }
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
                <div className="flex items-center justify-between px-4 py-3 border-t border-fm-border">
                  <span className="text-xs text-fm-muted">Halaman {page} dari {data?.totalPages ?? 1}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>← Prev</Button>
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= (data?.totalPages ?? 1)}>Next →</Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  )
}
