'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { PageLoading } from '@/components/ui/Loading'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { Plus, ArrowUp, ArrowDown, Pencil, Trash2 } from 'lucide-react'
import type { Room } from '@/lib/types'

export default function AdminRoomsPage() {
  const router = useRouter()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch('/api/rooms?all=true')
      const json = await res.json()
      if (json.success) setRooms(json.data)
    } catch (err) {
      console.error('Fetch rooms error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRooms() }, [fetchRooms])

  const toggleActive = async (room: Room) => {
    try {
      await fetch(`/api/rooms/${room.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !room.is_active }),
      })
      setRooms((prev) =>
        prev.map((r) => r.id === room.id ? { ...r, is_active: !r.is_active } : r)
      )
    } catch (err) {
      console.error('Toggle active error:', err)
    }
  }

  const moveRoom = async (idx: number, dir: -1 | 1) => {
    const target = idx + dir
    if (target < 0 || target >= rooms.length) return
    const updated = [...rooms]
    ;[updated[idx], updated[target]] = [updated[target], updated[idx]]
    updated.forEach((r, i) => (r.sort_order = i))
    setRooms(updated)

    // Save both rooms' sort_order
    try {
      await Promise.all([
        fetch(`/api/rooms/${updated[idx].id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sort_order: idx }),
        }),
        fetch(`/api/rooms/${updated[target].id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sort_order: target }),
        }),
      ])
    } catch (err) {
      console.error('Move room error:', err)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await fetch(`/api/rooms/${deleteTarget.id}`, { method: 'DELETE' })
      setRooms((prev) => prev.filter((r) => r.id !== deleteTarget.id))
    } catch (err) {
      console.error('Delete room error:', err)
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  if (loading) return <PageLoading />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">객실 관리</h1>
        <Button onClick={() => router.push('/admin/rooms/new')}>
          <Plus size={16} className="mr-1" /> 객실 추가
        </Button>
      </div>

      <div className="space-y-3">
        {rooms.length === 0 ? (
          <Card>
            <p className="text-center text-gray-400 py-8">등록된 객실이 없습니다.</p>
          </Card>
        ) : (
          rooms.map((room, idx) => (
            <Card key={room.id} padding={false}>
              <div className="flex items-center gap-4 p-4">
                {/* 썸네일 */}
                <div className="w-20 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {room.images && room.images.length > 0 ? (
                    <img
                      src={room.images.find((i) => i.is_primary)?.url || room.images[0].url}
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                  )}
                </div>

                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">{room.name}</h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{room.type || '일반'}</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    기준 {room.base_capacity}명 / 최대 {room.max_capacity}명
                    {room.size && ` / ${room.size}`}
                  </p>
                </div>

                {/* 노출 토글 */}
                <button
                  onClick={() => toggleActive(room)}
                  className={`relative w-10 h-6 rounded-full transition-colors ${
                    room.is_active ? 'bg-pension-primary' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${
                      room.is_active ? 'translate-x-4' : ''
                    }`}
                  />
                </button>

                {/* 순서 변경 */}
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveRoom(idx, -1)}
                    disabled={idx === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    onClick={() => moveRoom(idx, 1)}
                    disabled={idx === rooms.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-1">
                  <button
                    onClick={() => router.push(`/admin/rooms/${room.id}`)}
                    className="p-2 text-gray-500 hover:text-pension-primary hover:bg-gray-100 rounded-lg"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(room)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="객실 삭제"
        message={`"${deleteTarget?.name}" 객실을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        loading={deleting}
      />
    </div>
  )
}
