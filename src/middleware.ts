import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '')

async function verifyTokenMiddleware(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // /admin/login은 보호하지 않음
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  // /admin/** 경로 보호
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    const payload = await verifyTokenMiddleware(token)
    if (!payload) {
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.delete('auth_token')
      return response
    }

    return NextResponse.next()
  }

  // /api/admin/** 경로 보호
  if (pathname.startsWith('/api/admin')) {
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const payload = await verifyTokenMiddleware(token)
    if (!payload) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 토큰입니다.', code: 'INVALID_TOKEN' },
        { status: 401 }
      )
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
