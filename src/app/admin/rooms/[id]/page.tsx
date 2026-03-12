'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { PageLoading } from '@/components/ui/Loading'
import Button from '@/components/ui/Button'
import RoomForm from '@/components/admin/rooms/RoomForm'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import type { Room } from '@/lib/types'

export default function EditRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await fetch(`/api/rooms/${id}`)
        const json = await res.json()
        if (json.success) setRoom(json.data)
      } catch (err) {
        console.error('Fetch room error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchRoom()
  }, [id])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await fetch(`/api/rooms/${id}`, { method: 'DELETE' })
      router.push('/admin/rooms')
    } catch (err) {
      console.error('Delete room error:', err)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <PageLoading />
  if (!room) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">객실을 찾을 수 없습니다.</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.push('/admin/rooms')}>
          목록으로 돌아가기
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">객실 수정</h1>
        <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
          삭제
        </Button>
      </div>
      <RoomForm initialData={room} isEdit />

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="객실 삭제"
        message={`"${room.name}" 객실을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        loading={deleting}
      />
    </div>
  )
}
