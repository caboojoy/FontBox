'use client'

import { useEffect, useState } from 'react'
import { fontsDb } from '@/lib/supabase'

export default function DebugPage() {
  const [results, setResults] = useState<Record<string, string>>({})

  useEffect(() => {
    const run = async () => {
      const out: Record<string, string> = {}

      // 1. 환경변수
      out['① SUPABASE_URL'] = process.env.NEXT_PUBLIC_SUPABASE_URL
        ? '✅ ' + process.env.NEXT_PUBLIC_SUPABASE_URL.slice(0, 35) + '...'
        : '❌ 없음 — .env.local 확인'
      out['② SUPABASE_ANON_KEY'] = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? '✅ 설정됨'
        : '❌ 없음 — .env.local 확인'

      // 2. fonts.fonts 테이블 접근
      const { data: fontData, error: fontErr } = await fontsDb
        .from('fonts')
        .select('id, name')
        .limit(5)

      if (fontErr) {
        out['③ fonts.fonts 접근'] = '❌ ' + fontErr.message
        if (fontErr.message.includes('schema')) {
          out['→ 해결방법'] = 'Supabase → Settings → API → Extra Search Path 에 "fonts" 추가'
        } else if (fontErr.message.includes('relation')) {
          out['→ 해결방법'] = '01_fonts_schema.sql 실행 여부 확인'
        }
      } else if (!fontData || fontData.length === 0) {
        out['③ fonts.fonts 접근'] = '✅ 테이블 존재 — 데이터 없음'
        out['→ 해결방법'] = 'seed.sql 을 Supabase SQL Editor에서 실행하세요'
      } else {
        out['③ fonts.fonts 접근'] = '✅ ' + fontData.length + '개 조회됨'
        out['샘플'] = fontData.map((f: Record<string,unknown>) => f.name as string).join(', ')
      }

      // 3. ai_cache 테이블 접근
      const { error: cacheErr } = await fontsDb.from('ai_cache').select('id').limit(1)
      out['④ fonts.ai_cache 접근'] = cacheErr ? '❌ ' + cacheErr.message : '✅ 정상'

      setResults(out)
    }
    run()
  }, [])

  return (
    <div style={{ padding: '80px 32px', fontFamily: 'monospace', maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>🔍 FontBox 연결 진단</h1>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 28 }}>
        원인 파악 후 <code>app/debug</code> 폴더를 삭제하세요.
      </p>
      {Object.keys(results).length === 0 ? (
        <p>진단 중...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <tbody>
            {Object.entries(results).map(([k, v]) => (
              <tr key={k} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{
                  padding: '10px 20px 10px 0',
                  fontWeight: k.startsWith('→') ? 400 : 700,
                  color: k.startsWith('→') ? '#dc2626' : '#111',
                  whiteSpace: 'nowrap',
                  verticalAlign: 'top',
                  minWidth: 200,
                }}>
                  {k}
                </td>
                <td style={{
                  padding: '10px 0',
                  wordBreak: 'break-all',
                  color: String(v).startsWith('✅') ? '#16a34a' : String(v).startsWith('❌') ? '#dc2626' : '#374151',
                }}>
                  {v}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
