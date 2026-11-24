import { NextResponse, type NextRequest } from 'next/server'
import { ADMIN_COOKIE, verifySessionToken } from '@/lib/admin-auth'

// /admin 은 로그인한 관리자만 — 아니면 로그인 화면으로 보낸다
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (pathname === '/admin/login') return NextResponse.next()

  // 서버 액션 호출(POST + Next-Action 헤더)은 리다이렉트하면 화면이 결과를 받지 못한다.
  // 액션마다 isAdmin() 으로 다시 확인하므로 여기서는 통과시키고, 거절 사유는 액션이 돌려준다.
  if (req.method === 'POST' && req.headers.has('next-action')) return NextResponse.next()

  if (await verifySessionToken(req.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.next()
  }
  const url = req.nextUrl.clone()
  url.pathname = '/admin/login'
  url.search = ''
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
