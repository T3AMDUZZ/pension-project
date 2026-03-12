'use client'

import RoomForm from '@/components/admin/rooms/RoomForm'

export default function NewRoomPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">객실 등록</h1>
      <RoomForm />
    </div>
  )
}
