'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Card, { CardTitle } from '@/components/ui/Card'
import { PageLoading } from '@/components/ui/Loading'
import StatusBadge from '@/components/admin/StatusBadge'
import AdminCalendar from '@/components/admin/AdminCalendar'
import { formatPrice, formatDate } from '@/lib/utils'
import { LogIn, LogOut as LogOutIcon, BedDouble, CreditCard, TrendingUp } from 'lucide-react'
import type { DashboardSummary, Reservation } from '@/lib/types'

type CalendarReservation = Reservation & { rooms?: { id: string; name: string } | null }

export default function AdminDashboardPage() {
  const router = useRouter()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [recentReservations, setRecentReservations] = useState<Reservation[]>([])
  const [calendarData, setCalendarData] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const [calYear, setCalYear] = useState(now.getFullYear())
  const [calMonth, setCalMonth] = useState(now.getMonth() + 1)

  const fetchData = useCallback(async () => {
    try {
      const [summaryRes, reservationsRes] = await Promise.all([
        fetch('/api/dashboard/summary'),
        fetch('/api/reservations?limit=5'),
      ])
      const summaryJson = await summaryRes.json()
      const reservationsJson = await reservationsRes.json()

      if (summaryJson.success) setSummary(summaryJson.data)
      if (reservationsJson.data) setRecentReservations(reservationsJson.data)
    } catch (err) {
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchCalendar = useCallback(async () => {
    try {
      const res = await fetch(`/api/dashboard/calendar?year=${calYear}&month=${calMonth}`)
      const json = await res.json()
      if (json.success) setCalendarData(json.data)
    } catch (err) {
      console.error('Calendar fetch error:', err)
    }
  }, [calYear, calMonth])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { fetchCalendar() }, [fetchCalendar])

  if (loading) return <PageLoading />

  const statCards = [
    { label: '오늘 체크인', value: summary?.today_checkin ?? 0, icon: LogIn, color: 'text-blue-600 bg-blue-100' },
    { label: '오늘 체크아웃', value: summary?.today_checkout ?? 0, icon: LogOutIcon, color: 'text-purple-600 bg-purple-100' },
    { label: '투숙중', value: summary?.currently_staying ?? 0, icon: BedDouble, color: 'text-green-600 bg-green-100' },
    { label: '입금대기', value: summary?.awaiting_payment ?? 0, icon: CreditCard, color: 'text-orange-600 bg-orange-100' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>

      {/* 현황 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.label}>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* 매출 */}
      <Card>
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp size={20} className="text-pension-primary" />
          <CardTitle>이번 달 매출</CardTitle>
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {formatPrice(summary?.monthly_revenue ?? 0)}
        </p>
      </Card>

      {/* 월간 예약 캘린더 */}
      <Card>
        <CardTitle className="mb-4">월간 예약 현황</CardTitle>
        <AdminCalendar
          reservations={calendarData as CalendarReservation[]}
          year={calYear}
          month={calMonth}
          onMonthChange={(y, m) => { setCalYear(y); setCalMonth(m) }}
          onReservationClick={(r) => router.push(`/admin/reservations/${r.id}`)}
        />
      </Card>

      {/* 최근 예약 */}
      <Card>
        <CardTitle className="mb-4">최근 예약</CardTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-600">예약번호</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">예약자</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">객실</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">체크인</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">상태</th>
              </tr>
            </thead>
            <tbody>
              {recentReservations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">최근 예약이 없습니다.</td>
                </tr>
              ) : (
                recentReservations.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/admin/reservations/${r.id}`)}
                  >
                    <td className="px-4 py-3 font-mono text-xs">{r.reservation_number}</td>
                    <td className="px-4 py-3">{r.guest_name}</td>
                    <td className="px-4 py-3">{r.room?.name || '-'}</td>
                    <td className="px-4 py-3">{formatDate(r.check_in)}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
