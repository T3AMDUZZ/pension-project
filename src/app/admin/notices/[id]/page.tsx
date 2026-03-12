'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { PageLoading } from '@/components/ui/Loading'
import Button from '@/components/ui/Button'
import NoticeForm from '@/components/admin/notices/NoticeForm'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import type { Notice } from '@/lib/types'

export default function EditNoticePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [notice, setNotice] = useState<Notice | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const res = await fetch(`/api/notices/${id}`)
        const json = await res.json()
        if (json.success) setNotice(json.data)
      } catch (err) {
        console.error('Fetch notice error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchNotice()
  }, [id])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await fetch(`/api/notices/${id}`, { method: 'DELETE' })
      router.push('/admin/notices')
    } catch (err) {
      console.error('Delete notice error:', err)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <PageLoading />
  if (!notice) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">공지사항을 찾을 수 없습니다.</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.push('/admin/notices')}>
          목록으로 돌아가기
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">공지사항 수정</h1>
        <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
          삭제
        </Button>
      </div>
      <NoticeForm initialData={notice} isEdit />

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="공지사항 삭제"
        message={`"${notice.title}" 공지사항을 삭제하시겠습니까?`}
        confirmText="삭제"
        loading={deleting}
      />
    </div>
  )
}
