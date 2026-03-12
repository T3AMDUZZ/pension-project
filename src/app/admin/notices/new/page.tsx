'use client'

import NoticeForm from '@/components/admin/notices/NoticeForm'

export default function NewNoticePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">공지사항 작성</h1>
      <NoticeForm />
    </div>
  )
}
