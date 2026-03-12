'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-7xl font-bold text-red-400 mb-4">500</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          오류가 발생했습니다
        </h2>
        <p className="text-gray-500 mb-8">
          일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-pension-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-pension-primary/90 transition-colors"
          >
            다시 시도
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  )
}
