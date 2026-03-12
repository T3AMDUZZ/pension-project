import Header from '@/components/public/Header'
import Footer from '@/components/public/Footer'

// 사용자 페이지 레이아웃 (Header + Footer 포함)
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
