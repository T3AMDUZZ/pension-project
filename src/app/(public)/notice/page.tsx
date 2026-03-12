'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Pin, ChevronLeft, ChevronRight } from 'lucide-react'
import { PageLoading } from '@/components/ui/Loading'
import { formatDate } from '@/lib/utils'
import type { Notice } from '@/lib/types'

export default function NoticePage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10

  useEffect(() => {
    const fetchNotices = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/notices?page=${page}&limit=${limit}`)
        const json = await res.json()
        if (json.success) {
          setNotices(json.data || [])
          setTotalPages(json.total_pages || 1)
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchNotices()
  }, [page])

  if (loading && notices.length === 0) return <PageLoading />

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">공지사항</h1>
      <p className="text-gray-500 mb-8">펜션의 새로운 소식을 확인하세요</p>

      {notices.length > 0 ? (
        <>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
            {notices.map((notice) => (
              <Link
                key={notice.id}
                href={`/notice/${notice.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {notice.is_pinned && (
                    <span className="shrink-0 flex items-center gap-1 text-pension-primary text-xs font-bold bg-pension-primary/10 px-2 py-0.5 rounded">
                      <Pin size={10} />
                      필독
                    </span>
                  )}
                  <span className={`truncate ${notice.is_pinned ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                    {notice.title}
                  </span>
                </div>
                <span className="text-sm text-gray-400 ml-4 shrink-0">
                  {formatDate(notice.created_at)}
                </span>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    p === page
                      ? 'bg-pension-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          등록된 공지사항이 없습니다.
        </div>
      )}
    </div>
  )
}
