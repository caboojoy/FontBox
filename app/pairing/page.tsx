'use client'

import { useState, useEffect } from 'react'
import { Shuffle, Copy, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Font } from '@/types'
import { generateCSSCode } from '@/lib/fonts'

const PAIRING_SUGGESTIONS = [
  { ko:'noto-sans-kr',     en:'inter',           label:'깔끔한 UI' },
  { ko:'gothic-a1',        en:'dm-sans',          label:'모던 브랜딩' },
  { ko:'noto-serif-kr',    en:'playfair-display', label:'우아한 에디토리얼' },
  { ko:'ibm-plex-sans-kr', en:'fira-code',        label:'개발자 포트폴리오' },
  { ko:'black-han-sans',   en:'oswald',           label:'강렬한 헤드라인' },
  { ko:'gowun-dodum',      en:'nunito',           label:'부드러운 앱 UI' },
  { ko:'nanum-pen',        en:'dancing-script',   label:'감성 손글씨' },
  { ko:'sunflower',        en:'cormorant',        label:'럭셔리 패션' },
]

const PREVIEW_SENTENCES = [
  '디자인 스튜디오 Design Studio 2025',
  '브랜드 아이덴티티 Brand Identity',
  '크리에이티브 Creative Agency',
  '포트폴리오 Portfolio & Work',
  '서울 Seoul × New York',
]

export default function PairingPage() {
  const [koFonts, setKoFonts] = useState<Font[]>([])
  const [enFonts, setEnFonts] = useState<Font[]>([])
  const [koSlug, setKoSlug]   = useState('noto-sans-kr')
  const [enSlug, setEnSlug]   = useState('inter')
  const [sentence, setSentence] = useState(PREVIEW_SENTENCES[0])
  const [size, setSize]       = useState(36)
  const [koLoaded, setKoLoaded] = useState(false)
  const [enLoaded, setEnLoaded] = useState(false)
  const [copied, setCopied]   = useState(false)

  useEffect(() => {
    supabase.from('fonts').select('*').eq('supports_korean',true)
      .then(({data}) => setKoFonts((data as Font[])||[]))
    supabase.from('fonts').select('*').eq('language','english')
      .then(({data}) => setEnFonts((data as Font[])||[]))
  }, [])

  const koFont = koFonts.find(f=>f.slug===koSlug)
  const enFont = enFonts.find(f=>f.slug===enSlug)

  useEffect(() => {
    if (!koFont?.cdn_url) return
    setKoLoaded(false)
    const link = document.createElement('link')
    link.rel='stylesheet'; link.href=koFont.cdn_url
    link.onload=()=>setKoLoaded(true)
    document.head.appendChild(link)
  },[koFont?.cdn_url])

  useEffect(() => {
    if (!enFont?.cdn_url) return
    setEnLoaded(false)
    const link = document.createElement('link')
    link.rel='stylesheet'; link.href=enFont.cdn_url
    link.onload=()=>setEnLoaded(true)
    document.head.appendChild(link)
  },[enFont?.cdn_url])

  const randomize = () => {
    if(koFonts.length) setKoSlug(koFonts[Math.floor(Math.random()*koFonts.length)].slug)
    if(enFonts.length) setEnSlug(enFonts[Math.floor(Math.random()*enFonts.length)].slug)
  }

  const copyCSS = () => {
    if(!koFont||!enFont) return
    const css = `/* 한글: ${koFont.name} */\n${generateCSSCode(koFont)}\n\n/* 영문: ${enFont.name} */\n${generateCSSCode(enFont)}`
    navigator.clipboard.writeText(css)
    setCopied(true); setTimeout(()=>setCopied(false),2000)
  }

  const fontFamily = (koLoaded && enLoaded && koFont && enFont)
    ? `'${enFont.css_family}', '${koFont.css_family}', sans-serif`
    : 'inherit'

  const btnStyle = (active: boolean) => ({
    padding: '6px 14px',
    borderRadius: 100,
    fontSize: 13,
    fontWeight: active ? 600 : 500,
    border: active ? '1.5px solid #1E90FF' : '1.5px solid #e2e8f0',
    background: active ? '#1E90FF' : '#ffffff',
    color: active ? '#ffffff' : '#64748b',
    cursor: 'pointer',
    transition: 'all 0.18s',
    boxShadow: active ? '0 2px 10px rgba(30,144,255,0.25)' : 'none',
  })

  return (
    <div style={{ maxWidth: 1024, margin: '0 auto', padding: '96px 24px 80px' }}>

      {/* 헤더 */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: 40, fontWeight: 800, color: '#0f172a', marginBottom: 10, letterSpacing: '-0.02em' }}>
          폰트 페어링
        </h1>
        <p style={{ fontSize: 16, color: '#64748b' }}>한글 + 영문 폰트 조합을 실시간으로 미리보세요</p>
      </div>

      {/* 추천 조합 버튼 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 32 }}>
        {PAIRING_SUGGESTIONS.map(s => (
          <button key={s.label} onClick={() => { setKoSlug(s.ko); setEnSlug(s.en) }}
            style={btnStyle(koSlug===s.ko && enSlug===s.en)}>
            {s.label}
          </button>
        ))}
        <button onClick={randomize}
          style={{ ...btnStyle(false), display: 'flex', alignItems: 'center', gap: 5 }}>
          <Shuffle size={12} /> 랜덤
        </button>
      </div>

      {/* 미리보기 카드 */}
      <div style={{
        background: '#ffffff', borderRadius: 20,
        border: '1.5px solid #e2e8f0',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        padding: '32px', marginBottom: 24,
      }}>
        {/* 크기 슬라이더 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <input type="range" min={20} max={72} value={size}
            onChange={e => setSize(Number(e.target.value))}
            style={{ flex: 1, accentColor: '#1E90FF' }} />
          <span style={{ fontSize: 13, color: '#94a3b8', width: 40, textAlign: 'right' }}>{size}px</span>
        </div>

        {/* 미리보기 문장들 */}
        {PREVIEW_SENTENCES.map(s => (
          <div key={s} onClick={() => setSentence(s)}
            style={{
              fontFamily,
              fontSize: size,
              color: sentence === s ? '#1E90FF' : '#0f172a',
              lineHeight: 1.35,
              marginBottom: 12,
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 8,
              background: sentence === s ? 'rgba(30,144,255,0.04)' : 'transparent',
              transition: 'all 0.15s',
            }}>
            {s}
          </div>
        ))}

        {/* 폰트 정보 + CSS 복사 */}
        <div style={{
          marginTop: 24, paddingTop: 20,
          borderTop: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ display: 'flex', gap: 24 }}>
            <div>
              <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 3 }}>한글</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{koFont?.name || '–'}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 3 }}>영문</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{enFont?.name || '–'}</p>
            </div>
          </div>
          <button onClick={copyCSS} disabled={!koFont||!enFont}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              border: 'none', cursor: 'pointer',
              background: copied ? '#16a34a' : '#1E90FF',
              color: '#ffffff', transition: 'all 0.15s',
              opacity: (!koFont||!enFont) ? 0.4 : 1,
            }}>
            {copied ? <><Check size={14}/>복사됨</> : <><Copy size={14}/>CSS 복사</>}
          </button>
        </div>
      </div>

      {/* 폰트 선택 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {[
          { title: '한글 폰트', fonts: koFonts, slug: koSlug, onSelect: setKoSlug, color: '#1E90FF' },
          { title: '영문 폰트', fonts: enFonts, slug: enSlug, onSelect: setEnSlug, color: '#22c55e' },
        ].map(({ title, fonts, slug, onSelect, color }) => (
          <div key={title}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 10 }}>{title}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 280, overflowY: 'auto' }}>
              {fonts.length === 0 ? (
                <p style={{ fontSize: 13, color: '#94a3b8', padding: '12px 0' }}>로딩 중...</p>
              ) : fonts.map(f => (
                <button key={f.slug} onClick={() => onSelect(f.slug)}
                  style={{
                    textAlign: 'left', padding: '10px 14px', borderRadius: 10,
                    border: slug===f.slug ? `1.5px solid ${color}` : '1.5px solid #e2e8f0',
                    background: slug===f.slug ? `${color}0a` : '#ffffff',
                    color: slug===f.slug ? color : '#475569',
                    cursor: 'pointer', fontSize: 13, fontWeight: 500,
                    transition: 'all 0.15s',
                  }}>
                  <span style={{ fontWeight: 600 }}>{f.name}</span>
                  <span style={{ fontSize: 11, opacity: 0.6, marginLeft: 6 }}>{f.category}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
