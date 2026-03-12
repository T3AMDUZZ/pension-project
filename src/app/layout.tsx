import type { Metadata } from 'next'
import { Noto_Sans_KR } from 'next/font/google'
import './globals.css'

// Noto Sans KR 폰트 설정
const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-noto-sans-kr',
  display: 'swap',
})

// 기본 메타데이터
export const metadata: Metadata = {
  title: {
    default: '행복한 펜션',
    template: '%s | 행복한 펜션',
  },
  description: '자연 속에서 편안한 휴식을 즐기세요. 행복한 펜션에서 특별한 추억을 만들어 보세요. 온라인 예약 가능.',
  keywords: ['펜션', '숙박', '예약', '가평', '여행', '자연', '휴식', '바베큐', '가족여행'],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: '행복한 펜션',
    title: '행복한 펜션',
    description: '자연 속에서 편안한 휴식을 즐기세요. 행복한 펜션에서 특별한 추억을 만들어 보세요.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

// 루트 레이아웃
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className={`${notoSansKR.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
