import { cookies } from 'next/headers'
import { successResponse, errorResponse } from '@/lib/api-utils'

export async function POST() {
  try {
    const cookieStore = await cookies()
    cookieStore.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })

    return successResponse(null)
  } catch (err) {
    console.error('Logout error:', err)
    return errorResponse('서버 오류가 발생했습니다.', 'SERVER_ERROR', 500)
  }
}
