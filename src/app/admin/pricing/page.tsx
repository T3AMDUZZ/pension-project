'use client'

import { useState, useEffect, useCallback } from 'react'
import Card, { CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import { PageLoading } from '@/components/ui/Loading'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { Plus, Pencil, Trash2, Calendar } from 'lucide-react'
// utils imported as needed
import type { Season, Room, RoomPrice } from '@/lib/types'

export default function AdminPricingPage() {
  const [activeTab, setActiveTab] = useState<'seasons' | 'prices'>('seasons')
  const [seasons, setSeasons] = useState<Season[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [seasonsRes, roomsRes] = await Promise.all([
        fetch('/api/pricing/seasons'),
        fetch('/api/rooms?all=true'),
      ])
      const seasonsJson = await seasonsRes.json()
      const roomsJson = await roomsRes.json()
      if (seasonsJson.success) setSeasons(seasonsJson.data)
      if (roomsJson.success) setRooms(roomsJson.data)
    } catch (err) {
      console.error('Fetch pricing data error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) return <PageLoading />

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">요금 관리</h1>

      {/* 탭 */}
      <div className="flex gap-1 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('seasons')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'seasons'
              ? 'border-pension-primary text-pension-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          시즌 관리
        </button>
        <button
          onClick={() => setActiveTab('prices')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'prices'
              ? 'border-pension-primary text-pension-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          객실별 요금
        </button>
      </div>

      {activeTab === 'seasons' ? (
        <SeasonManager seasons={seasons} onUpdate={setSeasons} />
      ) : (
        <RoomPriceManager rooms={rooms} seasons={seasons} />
      )}
    </div>
  )
}

// ========== 시즌 관리 ==========
function SeasonManager({ seasons, onUpdate }: { seasons: Season[]; onUpdate: (s: Season[]) => void }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSeason, setEditingSeason] = useState<Season | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Season | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [minNights, setMinNights] = useState(1)

  const openAdd = () => {
    setEditingSeason(null)
    setName('')
    setStartDate('')
    setEndDate('')
    setMinNights(1)
    setModalOpen(true)
  }

  const openEdit = (season: Season) => {
    setEditingSeason(season)
    setName(season.name)
    setStartDate(season.start_date)
    setEndDate(season.end_date)
    setMinNights(season.min_nights)
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!name || !startDate || !endDate) return
    setSaving(true)
    try {
      const body = { name, start_date: startDate, end_date: endDate, min_nights: minNights }
      if (editingSeason) {
        const res = await fetch(`/api/pricing/seasons/${editingSeason.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const json = await res.json()
        if (json.success) {
          onUpdate(seasons.map((s) => s.id === editingSeason.id ? json.data : s))
        }
      } else {
        const res = await fetch('/api/pricing/seasons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const json = await res.json()
        if (json.success) {
          onUpdate([...seasons, json.data])
        }
      }
      setModalOpen(false)
    } catch (err) {
      console.error('Save season error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await fetch(`/api/pricing/seasons/${deleteTarget.id}`, { method: 'DELETE' })
      onUpdate(seasons.filter((s) => s.id !== deleteTarget.id))
    } catch (err) {
      console.error('Delete season error:', err)
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>시즌 목록</CardTitle>
          <Button size="sm" onClick={openAdd}>
            <Plus size={16} className="mr-1" /> 시즌 추가
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-600">시즌명</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">시작일</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">종료일</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">최소 숙박</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">관리</th>
              </tr>
            </thead>
            <tbody>
              {seasons.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">등록된 시즌이 없습니다.</td></tr>
              ) : (
                seasons.map((season) => (
                  <tr key={season.id} className="border-b border-gray-100">
                    <td className="px-4 py-3 font-medium">{season.name}</td>
                    <td className="px-4 py-3">{season.start_date}</td>
                    <td className="px-4 py-3">{season.end_date}</td>
                    <td className="px-4 py-3">{season.min_nights}박</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(season)} className="p-1.5 text-gray-500 hover:text-pension-primary hover:bg-gray-100 rounded">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setDeleteTarget(season)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 시즌 추가/수정 모달 */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSeason ? '시즌 수정' : '시즌 추가'}
      >
        <div className="space-y-4">
          <Input label="시즌명" value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 성수기" />
          <Input label="시작일" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input label="종료일" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <Input label="최소 숙박일" type="number" min={1} value={minNights} onChange={(e) => setMinNights(Number(e.target.value))} />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>취소</Button>
            <Button onClick={handleSave} loading={saving}>저장</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="시즌 삭제"
        message={`"${deleteTarget?.name}" 시즌을 삭제하시겠습니까?`}
        confirmText="삭제"
        loading={deleting}
      />
    </>
  )
}

// ========== 객실별 요금 관리 ==========
function RoomPriceManager({ rooms, seasons }: { rooms: Room[]; seasons: Season[] }) {
  const [selectedRoom, setSelectedRoom] = useState(rooms[0]?.id || '')
  const [, setPrices] = useState<(RoomPrice & { seasons?: Season })[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Editable price state
  const [editPrices, setEditPrices] = useState<Record<string, { weekday: number; weekend: number; extra: number }>>({})

  // Special price
  const [specialModalOpen, setSpecialModalOpen] = useState(false)
  const [specialDate, setSpecialDate] = useState('')
  const [specialPrice, setSpecialPrice] = useState(0)
  const [savingSpecial, setSavingSpecial] = useState(false)

  const fetchPrices = useCallback(async () => {
    if (!selectedRoom) return
    setLoading(true)
    try {
      const res = await fetch(`/api/pricing/rooms/${selectedRoom}`)
      const json = await res.json()
      if (json.success) {
        setPrices(json.data)
        const ep: Record<string, { weekday: number; weekend: number; extra: number }> = {}
        json.data.forEach((p: RoomPrice) => {
          ep[p.season_id] = {
            weekday: p.weekday_price,
            weekend: p.weekend_price,
            extra: p.extra_person_price,
          }
        })
        // Add empty entries for seasons without prices
        seasons.forEach((s) => {
          if (!ep[s.id]) {
            ep[s.id] = { weekday: 0, weekend: 0, extra: 0 }
          }
        })
        setEditPrices(ep)
      }
    } catch (err) {
      console.error('Fetch prices error:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedRoom, seasons])

  useEffect(() => { fetchPrices() }, [fetchPrices])

  const handlePriceChange = (seasonId: string, field: 'weekday' | 'weekend' | 'extra', value: number) => {
    setEditPrices((prev) => ({
      ...prev,
      [seasonId]: { ...prev[seasonId], [field]: value },
    }))
  }

  const savePrices = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const body = Object.entries(editPrices).map(([seasonId, p]) => ({
        season_id: seasonId,
        weekday_price: p.weekday,
        weekend_price: p.weekend,
        extra_person_price: p.extra,
      }))
      await fetch(`/api/pricing/rooms/${selectedRoom}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Save prices error:', err)
    } finally {
      setSaving(false)
    }
  }

  const saveSpecialPrice = async () => {
    if (!specialDate || !specialPrice) return
    setSavingSpecial(true)
    try {
      await fetch('/api/pricing/special', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_id: selectedRoom, date: specialDate, price: specialPrice }),
      })
      setSpecialModalOpen(false)
      setSpecialDate('')
      setSpecialPrice(0)
    } catch (err) {
      console.error('Save special price error:', err)
    } finally {
      setSavingSpecial(false)
    }
  }

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>객실별 요금</CardTitle>
          <div className="flex items-center gap-3">
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pension-primary/50"
            >
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </select>
            <Button size="sm" variant="ghost" onClick={() => setSpecialModalOpen(true)}>
              <Calendar size={16} className="mr-1" /> 특가 설정
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">로딩 중...</div>
        ) : seasons.length === 0 ? (
          <div className="text-center py-8 text-gray-400">시즌을 먼저 등록해주세요.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left font-medium text-gray-600">시즌</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">주중가</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">주말가</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">추가인원</th>
                  </tr>
                </thead>
                <tbody>
                  {seasons.map((season) => {
                    const ep = editPrices[season.id] || { weekday: 0, weekend: 0, extra: 0 }
                    return (
                      <tr key={season.id} className="border-b border-gray-100">
                        <td className="px-4 py-3 font-medium">{season.name}</td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={ep.weekday}
                            onChange={(e) => handlePriceChange(season.id, 'weekday', Number(e.target.value))}
                            className="w-28 rounded border border-gray-300 px-2 py-1 text-sm text-right"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={ep.weekend}
                            onChange={(e) => handlePriceChange(season.id, 'weekend', Number(e.target.value))}
                            className="w-28 rounded border border-gray-300 px-2 py-1 text-sm text-right"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={ep.extra}
                            onChange={(e) => handlePriceChange(season.id, 'extra', Number(e.target.value))}
                            className="w-28 rounded border border-gray-300 px-2 py-1 text-sm text-right"
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <Button size="sm" onClick={savePrices} loading={saving}>요금 저장</Button>
              {saved && <span className="text-sm text-green-600">저장되었습니다.</span>}
            </div>
          </>
        )}
      </Card>

      {/* 특가 설정 모달 */}
      <Modal isOpen={specialModalOpen} onClose={() => setSpecialModalOpen(false)} title="특가 설정">
        <div className="space-y-4">
          <Input label="날짜" type="date" value={specialDate} onChange={(e) => setSpecialDate(e.target.value)} />
          <Input label="특가 금액" type="number" value={specialPrice} onChange={(e) => setSpecialPrice(Number(e.target.value))} placeholder="0" />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setSpecialModalOpen(false)}>취소</Button>
            <Button onClick={saveSpecialPrice} loading={savingSpecial}>저장</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
