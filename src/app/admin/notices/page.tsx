'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { PageLoading } from '@/components/ui/Loading'
import Pagination from '@/components/admin/Pagination'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { Plus, Pin, PinOff, Pencil, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Notice } from '@/lib/types'

export default function AdminNoticesPage() {
  const router = useRouter()
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [deleteTarget, setDeleteTarget] = useState<Notice | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchNotices = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/notices?page=${page}&limit=${limit}`)
      const json = await res.json()
      if (json.data) {
        setNotices(json.data)
        setTotal(json.total || 0)
      }
    } catch (err) {
      console.error('Fetch notices error:', err)
    } finally {
      setLoading(false)
    }
  }, [page, limit])

  useEffect(() => { fetchNotices() }, [fetchNotices])

  const togglePin = async (notice: Notice) => {
    try {
      await fetch(`/api/notices/${notice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_pinned: !notice.is_pinned }),
      })
      setNotices((prev) =>
        prev.map((n) => n.id === notice.id ? { ...n, is_pinned: !n.is_pinned } : n)
      )
    } catch (err) {
      console.error('Toggle pin error:', err)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await fetch(`/api/notices/${deleteTarget.id}`, { method: 'DELETE' })
      setNotices((prev) => prev.filter((n) => n.id !== deleteTarget.id))
      setTotal((prev) => prev - 1)
    } catch (err) {
      console.error('Delete notice error:', err)
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  const totalPages = Math.ceil(total / limit)

  if (loading && notices.length === 0) return <PageLoading />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">공지사항 관리</h1>
        <Button onClick={() => router.push('/admin/notices/new')}>
          <Plus size={16} className="mr-1" /> 공지 작성
        </Button>
      </div>

      <Card padding={false}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-600 w-10">고정</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">제목</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 w-28">작성일</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600 w-24">관리</th>
            </tr>
          </thead>
          <tbody>
            {notices.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8 text-gray-400">공지사항이 없습니다.</td></tr>
            ) : (
              notices.map((notice) => (
                <tr key={notice.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => togglePin(notice)}
                      className={`p-1 rounded ${notice.is_pinned ? 'text-pension-primary' : 'text-gray-300 hover:text-gray-500'}`}
                    >
                      {notice.is_pinned ? <Pin size={16} /> : <PinOff size={16} />}
                    </button>
                  </td>
                  <td
                    className="px-4 py-3 cursor-pointer hover:text-pension-primary"
                    onClick={() => router.push(`/admin/notices/${notice.id}`)}
                  >
                    <span className="font-medium">{notice.title}</span>
                    {notice.is_pinned && (
                      <span className="ml-2 text-[10px] bg-pension-primary/10 text-pension-primary px-1.5 py-0.5 rounded">고정</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(notice.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => router.push(`/admin/notices/${notice.id}`)}
                        className="p-1.5 text-gray-500 hover:text-pension-primary hover:bg-gray-100 rounded"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(notice)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="p-4 border-t border-gray-100">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </Card>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="공지사항 삭제"
        message={`"${deleteTarget?.title}" 공지사항을 삭제하시겠습니까?`}
        confirmText="삭제"
        loading={deleting}
      />
    </div>
  )
}
