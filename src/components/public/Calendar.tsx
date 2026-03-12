'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DayAvailability } from '@/lib/types'

interface CalendarProps {
  roomId: string
  onDateSelect?: (checkIn: string | null, checkOut: string | null) => void
  selectedCheckIn?: string | null
  selectedCheckOut?: string | null
}

export default function Calendar({
  roomId,
  onDateSelect,
  selectedCheckIn = null,
  selectedCheckOut = null,
}: CalendarProps) {
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1)
  const [availability, setAvailability] = useState<DayAvailability[]>([])
  const [loading, setLoading] = useState(false)
  const [checkIn, setCheckIn] = useState<string | null>(selectedCheckIn)
  const [checkOut, setCheckOut] = useState<string | null>(selectedCheckOut)

  const fetchAvailability = useCallback(async () => {
    if (!roomId) return
    setLoading(true)
    try {
      const res = await fetch(
        `/api/availability?room_id=${roomId}&year=${currentYear}&month=${currentMonth}`
      )
      const json = await res.json()
      if (json.success) {
        setAvailability(json.data)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [roomId, currentYear, currentMonth])

  useEffect(() => {
    fetchAvailability()
  }, [fetchAvailability])

  useEffect(() => {
    setCheckIn(selectedCheckIn)
    setCheckOut(selectedCheckOut)
  }, [selectedCheckIn, selectedCheckOut])

  const goToPrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear((y) => y - 1)
      setCurrentMonth(12)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear((y) => y + 1)
      setCurrentMonth(1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }

  const handleDateClick = (dateStr: string) => {
    const dayInfo = availability.find((d) => d.date === dateStr)
    if (!dayInfo?.available) return

    // Past date check
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    if (dateStr < todayStr) return

    if (!checkIn || (checkIn && checkOut)) {
      // Start new selection
      setCheckIn(dateStr)
      setCheckOut(null)
      onDateSelect?.(dateStr, null)
    } else {
      // Set checkout
      if (dateStr <= checkIn) {
        setCheckIn(dateStr)
        setCheckOut(null)
        onDateSelect?.(dateStr, null)
      } else {
        // Check all dates in range are available
        const rangeAvailable = checkRangeAvailability(checkIn, dateStr)
        if (rangeAvailable) {
          setCheckOut(dateStr)
          onDateSelect?.(checkIn, dateStr)
        } else {
          // Reset and start from clicked date
          setCheckIn(dateStr)
          setCheckOut(null)
          onDateSelect?.(dateStr, null)
        }
      }
    }
  }

  const checkRangeAvailability = (start: string, end: string): boolean => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const current = new Date(startDate)
    current.setDate(current.getDate() + 1)
    while (current < endDate) {
      const dateStr = current.toISOString().split('T')[0]
      const dayInfo = availability.find((d) => d.date === dateStr)
      if (dayInfo && !dayInfo.available) return false
      current.setDate(current.getDate() + 1)
    }
    return true
  }

  const isInRange = (dateStr: string): boolean => {
    if (!checkIn || !checkOut) return false
    return dateStr > checkIn && dateStr < checkOut
  }

  // Calendar grid
  const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()
  const weeks: (number | null)[][] = []
  let week: (number | null)[] = new Array(firstDay).fill(null)

  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day)
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null)
    weeks.push(week)
  }

  const dayNames = ['일', '월', '화', '수', '목', '금', '토']

  const isPrevDisabled =
    currentYear === today.getFullYear() && currentMonth <= today.getMonth() + 1

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrevMonth}
          disabled={isPrevDisabled}
          className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className="text-lg font-bold text-gray-900">
          {currentYear}년 {currentMonth}월
        </h3>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 mb-1">
        {dayNames.map((name, i) => (
          <div
            key={name}
            className={cn(
              'text-center text-xs font-medium py-2',
              i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'
            )}
          >
            {name}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin h-6 w-6 border-2 border-pension-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-7">
          {weeks.map((w, wi) =>
            w.map((day, di) => {
              if (day === null) {
                return <div key={`${wi}-${di}`} className="h-14 md:h-16" />
              }

              const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const dayInfo = availability.find((d) => d.date === dateStr)
              const isAvailable = dayInfo?.available ?? true
              const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
              const isPast = dateStr < todayStr
              const isCheckIn = dateStr === checkIn
              const isCheckOut = dateStr === checkOut
              const inRange = isInRange(dateStr)
              const isDisabled = isPast || !isAvailable
              const dayOfWeek = new Date(dateStr).getDay()

              return (
                <button
                  key={`${wi}-${di}`}
                  onClick={() => !isDisabled && handleDateClick(dateStr)}
                  disabled={isDisabled}
                  className={cn(
                    'h-14 md:h-16 flex flex-col items-center justify-center text-sm relative transition-colors',
                    isDisabled && 'opacity-40 cursor-not-allowed bg-gray-50',
                    !isDisabled && 'hover:bg-pension-primary/10 cursor-pointer',
                    isCheckIn && 'bg-pension-primary text-white rounded-l-lg hover:bg-pension-primary',
                    isCheckOut && 'bg-pension-primary text-white rounded-r-lg hover:bg-pension-primary',
                    inRange && 'bg-pension-primary/15',
                    !isCheckIn && !isCheckOut && !inRange && dayOfWeek === 0 && 'text-red-500',
                    !isCheckIn && !isCheckOut && !inRange && dayOfWeek === 6 && 'text-blue-500'
                  )}
                >
                  <span className="font-medium">{day}</span>
                  {!isAvailable && !isPast && (
                    <span className="text-[10px] text-gray-400">마감</span>
                  )}
                  {isAvailable && !isPast && dayInfo?.price && (
                    <span className="text-[9px] text-gray-400 hidden md:block">
                      {(dayInfo.price / 10000).toFixed(0)}만
                    </span>
                  )}
                </button>
              )
            })
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-pension-primary" />
          <span>선택됨</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-pension-primary/15" />
          <span>숙박 기간</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gray-200" />
          <span>마감</span>
        </div>
      </div>
    </div>
  )
}
