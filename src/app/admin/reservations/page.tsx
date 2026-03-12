'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
// Loading component available from '@/components/ui/Loading'
import DataTable, { Column } from '@/components/admin/DataTable'
import StatusBadge from '@/components/admin/StatusBadge'
import Pagination from '@/components/admin/Pagination'
import { formatDate, formatPrice, formatPhone } from '@/lib/utils'
import { Search, Calendar } from 'lucide-react'
import type { Reservation, Room } from '@/lib/types'

const STATUS_TABS = [
  { key: '', label: '전체' },
  { key: 'pending', label: '예약대기' },
  { key: 'awaiting_payment', label: '입금대기' },
  { key: 'confirmed', label: '예약확정' },
  { key: 'checked_in', label: '체크인' },
  { key: 'checked_out', label: '체크아웃' },
  { key: 'cancelled', label: '취소' },
]

export default function AdminReservationsPage() {
  const router = useRouter()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)

  // Filters
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [roomId, setRoomId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch('/api/rooms?all=true')
      const json = await res.json()
      if (json.success) setRooms(json.data)
    } catch { /* ignore */ }
  }, [])

  const fetchReservations = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(limit))
      if (status) params.set('status', status)
      if (search) params.set('search', search)
      if (roomId) params.set('room_id', roomId)
      if (dateFrom) params.set('from', dateFrom)
      if (dateTo) params.set('to', dateTo)

      const res = await fetch(`/api/reservations?${params}`)
      const json = await res.json()
      if (json.data) {
        setReservations(json.data)
        setTotal(json.total || 0)
      }
    } catch (err) {
      console.error('Fetch reservations error:', err)
    } finally {
      setLoading(false)
    }
  }, [page, limit, status, search, roomId, dateFrom, dateTo])

  useEffect(() => { fetchRooms() }, [fetchRooms])
  useEffect(() => { fetchReservations() }, [fetchReservations])

  const handleSearch = () => {
    setSearch(searchInput)
    setPage(1)
  }

  const totalPages = Math.ceil(total / limit)

  const columns: Column<Reservation>[] = [
    { key: 'reservation_number', label: '예약번호', render: (r) => (
      <span className="font-mono text-xs text-pension-primary">{r.reservation_number}</span>
    )},
    { key: 'guest_name', label: '예약자', sortable: true },
    { key: 'phone', label: '연락처', render: (r) => formatPhone(r.phone) },
    { key: 'room', label: '객실', render: (r) => r.room?.name || '-' },
    { key: 'check_in', label: '체크인', sortable: true, render: (r) => formatDate(r.check_in) },
    { key: 'check_out', label: '체크아웃', render: (r) => formatDate(r.check_out) },
    { key: 'guests_count', label: '인원', render: (r) => `${r.guests_count}명` },
    { key: 'total_price', label: '요금', sortable: true, render: (r) => formatPrice(r.total_price) },
    { key: 'payment_method', label: '결제', render: (r) => r.payment_method === 'bank_transfer' ? '계좌이체' : '현장결제' },
    { key: 'status', label: '상태', render: (r) => <StatusBadge status={r.status} /> },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">예약 관리</h1>
        <Button variant="ghost" size="sm" onClick={() => router.push('/admin/reservations/calendar')}>
          <Calendar size={16} className="mr-1" /> 캘린더 보기
        </Button>
      </div>

      {/* 상태 탭 */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setStatus(tab.key); setPage(1) }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              status === tab.key
                ? 'border-pension-primary text-pension-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 필터 영역 */}
      <Card>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">검색</label>
            <div className="flex gap-2">
              <Input
                placeholder="예약자명 / 연락처 / 예약번호"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button size="sm" onClick={handleSearch}>
                <Search size={16} />
              </Button>
            </div>
          </div>
          <div className="min-w-[150px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">객실</label>
            <select
              value={roomId}
              onChange={(e) => { setRoomId(e.target.value); setPage(1) }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pension-primary/50"
            >
              <option value="">전체 객실</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </select>
          </div>
          <div className="min-w-[140px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">시작일</label>
            <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1) }} />
          </div>
          <div className="min-w-[140px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">종료일</label>
            <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1) }} />
          </div>
        </div>
      </Card>

      {/* 테이블 */}
      <Card padding={false}>
        <DataTable
          columns={columns}
          data={reservations}
          loading={loading}
          onRowClick={(r) => router.push(`/admin/reservations/${r.id}`)}
          emptyMessage="예약 내역이 없습니다."
        />
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">총 {total}건</span>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      </Card>
    </div>
  )
}
