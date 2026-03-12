import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from './auth'

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function errorResponse(error: string, code: string, status = 400) {
  return NextResponse.json({ success: false, error, code }, { status })
}

export function paginatedResponse<T>(data: T[], total: number, page: number, limit: number) {
  return NextResponse.json({
    success: true,
    data,
    total,
    page,
    limit,
    total_pages: Math.ceil(total / limit),
  })
}

/**
 * 관리자 인증 체크 헬퍼
 * 인증 성공 시 payload 반환, 실패 시 null 반환
 */
export async function requireAdmin(): Promise<{ id: string; username: string } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  if (!token) return null

  const payload = await verifyToken(token)
  if (!payload || !payload.id || !payload.username) return null

  return { id: payload.id as string, username: payload.username as string }
}

/**
 * 관리자 인증 체크 후 실패 시 401 응답 반환하는 헬퍼
 */
export async function withAdmin() {
  const admin = await requireAdmin()
  if (!admin) {
    return { admin: null, error: errorResponse('인증이 필요합니다.', 'UNAUTHORIZED', 401) }
  }
  return { admin, error: null }
}
