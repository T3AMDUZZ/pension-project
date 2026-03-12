import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-7xl font-bold text-pension-primary mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="text-gray-500 mb-8">
          요청하신 페이지가 존재하지 않거나, 주소가 변경되었을 수 있습니다.
        </p>
        <Link
          href="/"
          className="inline-block bg-pension-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-pension-primary/90 transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  )
}
