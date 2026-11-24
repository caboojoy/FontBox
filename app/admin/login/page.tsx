'use client'

import { useState } from 'react'
import { Lock } from 'lucide-react'
import { login } from '@/actions/admin-auth'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || pending) return
    setPending(true)
    setError(null)
    const result = await login(password).catch(() => ({ success: false, error: '로그인 중 오류가 났습니다. 잠시 후 다시 시도해 주세요.' }))
    if (result.success) {
      window.location.href = '/admin'
      return
    }
    setError(result.error || '로그인 실패')
    setPassword('')
    setPending(false)
  }

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: '140px 24px 80px' }}>
      <form onSubmit={submit} className="p-8 rounded-2xl"
        style={{ background: 'rgba(255,255,255,0.35)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--text-primary)' }}>
          <Lock size={18} />
          <h1 className="text-xl font-bold">관리자 로그인</h1>
        </div>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          폰트 추가·수정·삭제는 관리자만 할 수 있습니다.
        </p>

        <label htmlFor="admin-password" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
          비밀번호
        </label>
        <input id="admin-password" type="password" autoComplete="current-password" autoFocus
          value={password} onChange={e => setPassword(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none mb-4"
          style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />

        {error && (
          <p role="alert" className="text-sm mb-4" style={{ color: '#dc2626' }}>{error}</p>
        )}

        <button type="submit" disabled={!password || pending}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50"
          style={{ background: 'var(--accent)' }}>
          {pending ? '확인 중…' : '로그인'}
        </button>
      </form>
    </div>
  )
}
