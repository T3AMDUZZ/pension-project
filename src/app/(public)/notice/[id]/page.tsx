'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import Button from '@/components/ui/Button'
import { PageLoading } from '@/components/ui/Loading'
import { formatDate } from '@/lib/utils'
import type { Notice } from '@/lib/types'

export default function NoticeDetailPage() {
  const params = useParams()
  const noticeId = params.id as string

  const [notice, setNotice] = useState<Notice | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const res = await fetch(`/api/notices/${noticeId}`)
        const json = await res.json()
        if (json.success) {
          setNotice(json.data)
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchNotice()
  }, [noticeId])

  if (loading) return <PageLoading />

  if (!notice) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 text-lg mb-4">공지사항을 찾을 수 없습니다.</p>
        <Link href="/notice">
          <Button variant="outline">목록으로 돌아가기</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <Link
        href="/notice"
        className="inline-flex items-center text-sm text-gray-500 hover:text-pension-primary transition-colors mb-6"
      >
        <ChevronLeft size={16} />
        목록으로
      </Link>

      {/* Notice content */}
      <article className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            {notice.is_pinned && (
              <span className="text-pension-primary text-xs font-bold bg-pension-primary/10 px-2 py-0.5 rounded">
                필독
              </span>
            )}
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
            {notice.title}
          </h1>
          <p className="text-sm text-gray-400">
            {formatDate(notice.created_at)}
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          <div
            className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line"
          >
            {notice.content}
          </div>
        </div>
      </article>

      {/* Bottom navigation */}
      <div className="mt-6 text-center">
        <Link href="/notice">
          <Button variant="outline">목록으로 돌아가기</Button>
        </Link>
      </div>
    </div>
  )
}
