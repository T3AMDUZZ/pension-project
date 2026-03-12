'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Reservation } from '@/lib/types'
import { getStatusLabel } from '@/lib/utils'

interface CalendarReservation extends Reservation {
  rooms?: { id: string; name: string } | null
}

interface AdminCalendarProps {
  reservations: CalendarReservation[]
  year: number
  month: number
  onMonthChange: (year: number, month: number) => void
  onReservationClick?: (reservation: CalendarReservation) => void
  onDateClick?: (date: string) => void
}

export default function AdminCalendar({
  reservations,
  year,
  month,
  onMonthChange,
  onReservationClick,
  onDateClick,
}: AdminCalendarProps) {
  const [, setHoveredRes] = useState<string | null>(null)

  const { weeks } = useMemo(() => {
    const dim = new Date(year, month, 0).getDate()
    const fdow = new Date(year, month - 1, 1).getDay()
    const totalCells = Math.ceil((dim + fdow) / 7) * 7
    const w: (number | null)[][] = []
    for (let i = 0; i < totalCells; i += 7) {
      const week: (number | null)[] = []
      for (let j = 0; j < 7; j++) {
        const dayIdx = i + j - fdow + 1
        week.push(dayIdx >= 1 && dayIdx <= dim ? dayIdx : null)
      }
      w.push(week)
    }
    return { daysInMonth: dim, firstDayOfWeek: fdow, weeks: w }
  }, [year, month])

  const getDateStr = (day: number) =>
    `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const getReservationsForDate = (day: number) => {
    const dateStr = getDateStr(day)
    return reservations.filter((r) => r.check_in <= dateStr && r.check_out > dateStr)
  }

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const prevMonth = () => {
    if (month === 1) onMonthChange(year - 1, 12)
    else onMonthChange(year, month - 1)
  }

  const nextMonth = () => {
    if (month === 12) onMonthChange(year + 1, 1)
    else onMonthChange(year, month + 1)
  }

  const dayNames = ['일', '월', '화', '수', '목', '금', '토']

  const statusBarColor: Record<string, string> = {
    pending: 'bg-yellow-400',
    awaiting_payment: 'bg-orange-400',
    payment_confirmed: 'bg-blue-400',
    confirmed: 'bg-green-500',
    checked_in: 'bg-purple-500',
    checked_out: 'bg-gray-400',
    cancelled: 'bg-red-400',
    no_show: 'bg-red-300',
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100">
          <ChevronLeft size={20} />
        </button>
        <h3 className="text-lg font-semibold">
          {year}년 {month}월
        </h3>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Day Names */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {dayNames.map((name, i) => (
            <div
              key={name}
              className={`px-2 py-2 text-center text-xs font-medium ${
                i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-600'
              }`}
            >
              {name}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b border-gray-100 last:border-b-0">
            {week.map((day, di) => {
              if (day === null) {
                return <div key={di} className="min-h-[80px] bg-gray-50/50" />
              }

              const dateStr = getDateStr(day)
              const dayRes = getReservationsForDate(day)
              const isToday = dateStr === todayStr

              return (
                <div
                  key={di}
                  className={`min-h-[80px] p-1 border-r border-gray-100 last:border-r-0 ${
                    isToday ? 'bg-pension-light/30' : ''
                  } ${onDateClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                  onClick={() => onDateClick?.(dateStr)}
                >
                  <div
                    className={`text-xs mb-1 ${
                      isToday
                        ? 'bg-pension-primary text-white w-5 h-5 rounded-full flex items-center justify-center'
                        : di === 0
                          ? 'text-red-500'
                          : di === 6
                            ? 'text-blue-500'
                            : 'text-gray-700'
                    }`}
                  >
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {dayRes.slice(0, 3).map((r) => (
                      <div
                        key={r.id}
                        className={`text-[10px] px-1 py-0.5 rounded truncate cursor-pointer ${
                          statusBarColor[r.status] || 'bg-gray-300'
                        } text-white`}
                        title={`${r.rooms?.name || ''} - ${r.guest_name} (${getStatusLabel(r.status)})`}
                        onClick={(e) => {
                          e.stopPropagation()
                          onReservationClick?.(r)
                        }}
                        onMouseEnter={() => setHoveredRes(r.id)}
                        onMouseLeave={() => setHoveredRes(null)}
                      >
                        {r.rooms?.name || '객실'} {r.guest_name}
                      </div>
                    ))}
                    {dayRes.length > 3 && (
                      <div className="text-[10px] text-gray-400 px-1">
                        +{dayRes.length - 3}건
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
