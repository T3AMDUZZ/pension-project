'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Card, { CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import ImageUploader from '@/components/admin/ImageUploader'
import type { Room, RoomImage } from '@/lib/types'

const ROOM_TYPES = ['독채', '커플룸', '특실', '패밀리룸', '스탠다드', '디럭스']
const AMENITIES_LIST = [
  '에어컨', 'TV', '와이파이', '바베큐', '주차', '욕조',
  '냉장고', '전자레인지', '세탁기', '드라이기', '다리미', '취사도구',
]

interface RoomFormProps {
  initialData?: Room
  isEdit?: boolean
}

export default function RoomForm({ initialData, isEdit }: RoomFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState(initialData?.name || '')
  const [type, setType] = useState(initialData?.type || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [baseCapacity, setBaseCapacity] = useState(initialData?.base_capacity || 2)
  const [maxCapacity, setMaxCapacity] = useState(initialData?.max_capacity || 4)
  const [size, setSize] = useState(initialData?.size || '')
  const [amenities, setAmenities] = useState<string[]>(initialData?.amenities || [])
  const [images, setImages] = useState<RoomImage[]>(initialData?.images || [])

  const toggleAmenity = (a: string) => {
    setAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('객실명을 입력해주세요.')
      return
    }

    setSaving(true)
    try {
      const body = {
        name: name.trim(),
        type,
        description,
        base_capacity: baseCapacity,
        max_capacity: maxCapacity,
        size,
        amenities,
        images,
      }

      const url = isEdit ? `/api/rooms/${initialData?.id}` : '/api/rooms'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()

      if (json.success || json.data) {
        router.push('/admin/rooms')
      } else {
        setError(json.error || '저장에 실패했습니다.')
      }
    } catch {
      setError('서버에 연결할 수 없습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
      )}

      <Card>
        <CardTitle className="mb-4">기본 정보</CardTitle>
        <div className="space-y-4">
          <Input
            label="객실명 *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 소나무 독채"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">객실 유형</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pension-primary/50"
            >
              <option value="">선택</option>
              {ROOM_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">소개</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pension-primary/50"
              placeholder="객실 소개를 입력하세요..."
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="기준 인원"
              type="number"
              min={1}
              value={baseCapacity}
              onChange={(e) => setBaseCapacity(Number(e.target.value))}
            />
            <Input
              label="최대 인원"
              type="number"
              min={1}
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(Number(e.target.value))}
            />
            <Input
              label="크기"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="예: 49.5㎡"
            />
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle className="mb-4">편의시설</CardTitle>
        <div className="flex flex-wrap gap-2">
          {AMENITIES_LIST.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => toggleAmenity(a)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                amenities.includes(a)
                  ? 'bg-pension-primary text-white border-pension-primary'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-pension-primary'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle className="mb-4">이미지</CardTitle>
        <ImageUploader images={images} onChange={setImages} />
      </Card>

      <div className="flex gap-3">
        <Button type="submit" loading={saving}>
          {isEdit ? '수정' : '등록'}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push('/admin/rooms')}>
          취소
        </Button>
      </div>
    </form>
  )
}
