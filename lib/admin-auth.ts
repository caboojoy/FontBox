// 관리자 로그인 세션 — 서명된 쿠키로 확인한다.
// Web Crypto 만 써서 미들웨어(edge)와 서버 액션(node) 양쪽에서 같이 쓴다.
//
// 쿠키 값: "<만료시각(ms)>.<HMAC-SHA256(ADMIN_PASSWORD, 만료시각) hex>"
// ADMIN_PASSWORD 를 바꾸면 기존 세션은 모두 무효가 된다.
// ADMIN_PASSWORD 가 없으면 아무도 로그인할 수 없다 (관리 기능 잠김).

export const ADMIN_COOKIE = 'fontbox_admin'
export const ADMIN_SESSION_MS = 12 * 60 * 60 * 1000 // 12시간

const encoder = new TextEncoder()

function adminPassword(): string | null {
  const p = process.env.ADMIN_PASSWORD
  return p && p.length > 0 ? p : null
}

export function isAdminConfigured(): boolean {
  return adminPassword() !== null
}

async function hmacHex(key: string, message: string): Promise<string> {
  const k = await crypto.subtle.importKey('raw', encoder.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', k, encoder.encode(message))
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('')
}

// 길이가 같을 때 끝까지 비교해 시간 차로 값을 추측하지 못하게 한다
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export async function checkPassword(input: string): Promise<boolean> {
  const password = adminPassword()
  if (!password) return false
  // 원문 대신 같은 키로 만든 서명끼리 비교한다 (길이로 새는 정보 없음)
  const [a, b] = await Promise.all([hmacHex('fontbox-pw', input), hmacHex('fontbox-pw', password)])
  return safeEqual(a, b)
}

export async function createSessionToken(now = Date.now()): Promise<string> {
  const password = adminPassword()
  if (!password) throw new Error('ADMIN_PASSWORD 가 설정되지 않았습니다.')
  const exp = String(now + ADMIN_SESSION_MS)
  return `${exp}.${await hmacHex(password, `fontbox-admin:${exp}`)}`
}

export async function verifySessionToken(token: string | undefined | null, now = Date.now()): Promise<boolean> {
  const password = adminPassword()
  if (!password || !token) return false
  const [exp, sig] = token.split('.')
  if (!exp || !sig || !/^\d+$/.test(exp) || Number(exp) < now) return false
  return safeEqual(sig, await hmacHex(password, `fontbox-admin:${exp}`))
}
