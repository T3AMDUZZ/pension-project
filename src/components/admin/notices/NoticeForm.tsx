'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Card, { CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import type { Notice } from '@/lib/types'

interface NoticeFormProps {
  initialData?: Notice
  isEdit?: boolean
}

export default function NoticeForm({ initialData, isEdit }: NoticeFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState(initialData?.title || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [isPinned, setIsPinned] = useState(initialData?.is_pinned || false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('제목을 입력해주세요.')
      return
    }
    if (!content.trim()) {
      setError('내용을 입력해주세요.')
      return
    }

    setSaving(true)
    try {
      const body = { title: title.trim(), content: content.trim(), is_pinned: isPinned }
      const url = isEdit ? `/api/notices/${initialData?.id}` : '/api/notices'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()

      if (json.success || json.data) {
        router.push('/admin/notices')
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
      )}

      <Card>
        <CardTitle className="mb-4">공지사항 {isEdit ? '수정' : '작성'}</CardTitle>
        <div className="space-y-4">
          <Input
            label="제목 *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="공지사항 제목"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">내용 *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pension-primary/50"
              placeholder="공지사항 내용을 입력하세요..."
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-4 h-4 text-pension-primary rounded border-gray-300 focus:ring-pension-primary"
            />
            <span className="text-sm text-gray-700">상단 고정</span>
          </label>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" loading={saving}>
          {isEdit ? '수정' : '등록'}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push('/admin/notices')}>
          취소
        </Button>
      </div>
    </form>
  )
}
