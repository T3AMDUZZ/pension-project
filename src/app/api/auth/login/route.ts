import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createToken } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return errorResponse('아이디와 비밀번호를 입력해주세요.', 'MISSING_FIELDS')
    }

    // 목업: 하드코딩된 관리자 계정
    if (username !== 'admin' || password !== 'admin1234') {
      return errorResponse('아이디 또는 비밀번호가 올바르지 않습니다.', 'INVALID_CREDENTIALS', 401)
    }

    const token = await createToken({ id: 'admin-1', username: 'admin' })

    const cookieStore = await cookies()
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24시간
    })

    return successResponse({ username: 'admin' })
  } catch (err) {
    console.error('Login error:', err)
    return errorResponse('서버 오류가 발생했습니다.', 'SERVER_ERROR', 500)
  }
}
