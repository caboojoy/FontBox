'use server'

import { cookies } from 'next/headers'
import {
  ADMIN_COOKIE, ADMIN_SESSION_MS,
  checkPassword, createSessionToken, isAdminConfigured, verifySessionToken,
} from '@/lib/admin-auth'

// 서버 액션에서 관리자 여부 확인 (미들웨어와 별개로 다시 확인한다)
export async function isAdmin(): Promise<boolean> {
  return verifySessionToken(cookies().get(ADMIN_COOKIE)?.value)
}

export async function login(password: string): Promise<{ success: boolean; error?: string }> {
  if (!isAdminConfigured()) {
    return { success: false, error: '서버에 ADMIN_PASSWORD 가 설정되지 않아 관리 기능이 잠겨 있습니다.' }
  }
  if (typeof password !== 'string' || !(await checkPassword(password))) {
    // 무차별 대입을 늦추기 위해 실패 응답을 조금 지연한다
    await new Promise(r => setTimeout(r, 1000))
    return { success: false, error: '비밀번호가 맞지 않습니다.' }
  }
  cookies().set(ADMIN_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: ADMIN_SESSION_MS / 1000,
  })
  return { success: true }
}

export async function logout(): Promise<void> {
  cookies().delete(ADMIN_COOKIE)
}
