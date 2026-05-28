'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'

export default function SuppliersPage() {
  const [page, setPage] = React.useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['suppliers', page],
    queryFn: async () => {
      const res = await fetch(`/api/suppliers?page=${page}`)
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
  })

  const suppliers = data?.data ?? []

  return (
    <>
      <Header title="Supplier" />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader><CardTitle>Daftar Supplier</CardTitle></CardHeader>
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
                      <TableHead>Nama Supplier</TableHead>
                      <TableHead>Kontak</TableHead>
                      <TableHead>Kota</TableHead>
                      <TableHead>Telepon</TableHead>
                      <TableHead className="text-right">Produk</TableHead>
                      <TableHead className="text-right">PO</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.map((s: {
                      supplier_id: number
                      supplier_code: string
                      supplier_name: string
                      contact_name: string | null
                      phone: string | null
                      city: { city_name: string }
                      _count: { products: number; purchase_orders: number }
                    }) => (
                      <TableRow key={s.supplier_id}>
                        <TableCell className="font-mono text-xs text-fm-muted">{s.supplier_code}</TableCell>
                        <TableCell className="font-medium text-sm">{s.supplier_name}</TableCell>
                        <TableCell className="text-xs text-fm-muted">{s.contact_name ?? '-'}</TableCell>
                        <TableCell className="text-xs text-fm-muted">{s.city.city_name}</TableCell>
                        <TableCell className="text-xs text-fm-muted">{s.phone ?? '-'}</TableCell>
                        <TableCell className="text-right text-xs">{s._count.products}</TableCell>
                        <TableCell className="text-right text-xs">{s._count.purchase_orders}</TableCell>
                      </TableRow>
                    ))}
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
