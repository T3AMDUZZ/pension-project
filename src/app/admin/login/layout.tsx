// 로그인 페이지는 AdminLayout을 사용하지 않음 (독립 레이아웃)
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
