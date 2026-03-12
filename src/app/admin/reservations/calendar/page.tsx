'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import Card from '@/components/ui/Card'
import { PageLoading } from '@/components/ui/Loading'
import AdminCalendar from '@/components/admin/AdminCalendar'
import ManualReservationModal from '@/components/admin/ManualReservationModal'
import type { Reservation, Room } from '@/lib/types'

type CalendarReservation = Reservation & { rooms?: { id: string; name: string } | null }

export default function ReservationCalendarPage() {
  const router = useRouter()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | undefined>()
  const [rooms, setRooms] = useState<Room[]>([])

  const fetchCalendar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/dashboard/calendar?year=${year}&month=${month}`)
      const json = await res.json()
      if (json.success) setReservations(json.data)
    } catch (err) {
      console.error('Calendar fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [year, month])

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch('/api/rooms')
      const json = await res.json()
      if (json.success) setRooms(json.data)
    } catch (err) {
      console.error('Rooms fetch error:', err)
    }
  }, [])

  useEffect(() => { fetchCalendar() }, [fetchCalendar])
  useEffect(() => { fetchRooms() }, [fetchRooms])

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr)
    setShowModal(true)
  }

  const handleManualReservationSubmit = () => {
    fetchCalendar()
  }

  if (loading && reservations.length === 0) return <PageLoading />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">예약 캘린더</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedDate(undefined)
              setShowModal(true)
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-pension-primary text-white rounded-lg text-sm font-medium hover:bg-pension-primary/90"
          >
            <Plus size={16} />
            수동 예약 등록
          </button>
          <button
            onClick={() => router.push('/admin/reservations')}
            className="text-sm text-pension-primary hover:underline"
          >
            목록 보기
          </button>
        </div>
      </div>

      <Card>
        <AdminCalendar
          reservations={reservations as CalendarReservation[]}
          year={year}
          month={month}
          onMonthChange={(y, m) => { setYear(y); setMonth(m) }}
          onReservationClick={(r) => router.push(`/admin/reservations/${r.id}`)}
          onDateClick={handleDateClick}
        />
      </Card>

      <ManualReservationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleManualReservationSubmit}
        selectedDate={selectedDate}
        rooms={rooms}
      />
    </div>
  )
}
