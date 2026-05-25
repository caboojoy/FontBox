'use client'

import { useState, useEffect, useCallback } from 'react'
import { Shuffle, Copy, Check } from 'lucide-react'
import { fontsDb as supabase } from '@/lib/supabase'
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
    const css = `/* 한글: ${koFont.name} */\n${generateCSSCode(koFont)}\n\n/* 영문: ${enFont.name} */\n${generateCSSCode(enFont)}\n\n/* 혼용 */\nbody { font-family: '${enFont.css_family}', '${koFont.css_family}', sans-serif; }`
    navigator.clipboard.writeText(css)
    setCopied(true); setTimeout(()=>setCopied(false),2000)
  }

  const fontStyle = (loaded:boolean, family?:string) =>
    loaded && family ? `'${family}', sans-serif` : 'inherit'

  return (
    <div className="max-w-5xl mx-auto px-4 pt-24 pb-16">
      <div className="text-center mb-10 animate-fade-up">
        <h1 className="font-display text-4xl font-bold mb-3" style={{color:'var(--text-primary)'}}>폰트 페어링</h1>
        <p style={{color:'var(--text-secondary)'}}>한글+영문 폰트 조합을 실시간으로 미리보세요</p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center mb-8 animate-fade-up delay-100">
        {PAIRING_SUGGESTIONS.map(s=>(
          <button key={s.label} onClick={()=>{setKoSlug(s.ko);setEnSlug(s.en)}}
            className={`filter-btn ${koSlug===s.ko&&enSlug===s.en?'active':''}`}>{s.label}</button>
        ))}
        <button onClick={randomize} className="filter-btn flex items-center gap-1">
          <Shuffle size={12}/> 랜덤
        </button>
      </div>

      <div className="font-card p-8 mb-6 animate-fade-up delay-200">
        <div className="flex items-center gap-4 mb-6">
          <input type="range" min={20} max={72} value={size}
            onChange={e=>setSize(Number(e.target.value))} className="flex-1 accent-sky-accent"/>
          <span className="text-sm w-12 text-right tabular-nums" style={{color:'var(--text-muted)'}}>{size}px</span>
        </div>
        {PREVIEW_SENTENCES.map(s=>(
          <div key={s} onClick={()=>setSentence(s)}
            className="preview-text mb-3 cursor-pointer rounded-lg px-2 py-1 transition-all hover:bg-white/20"
            style={{
              fontFamily: fontStyle(koLoaded&&enLoaded, enFont?.css_family ? `${enFont.css_family}', '${koFont?.css_family}` : undefined),
              fontSize:`${size}px`,
              color:sentence===s?'var(--accent)':'var(--text-primary)',
              lineHeight:1.3,
            }}>
            {s}
          </div>
        ))}
        <div className="mt-6 pt-4 border-t flex items-center justify-between" style={{borderColor:'var(--border)'}}>
          <div className="flex gap-6">
            <div>
              <p className="text-xs mb-1" style={{color:'var(--text-muted)'}}>한글</p>
              <p className="text-sm font-medium" style={{color:'var(--text-primary)'}}>{koFont?.name||'–'}</p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{color:'var(--text-muted)'}}>영문</p>
              <p className="text-sm font-medium" style={{color:'var(--text-primary)'}}>{enFont?.name||'–'}</p>
            </div>
          </div>
          <button onClick={copyCSS} disabled={!koFont||!enFont}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40"
            style={{background:'var(--accent)',color:'white'}}>
            {copied?<Check size={14}/>:<Copy size={14}/>} CSS 복사
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-up delay-300">
        {[
          {title:'한글 폰트', fonts:koFonts, slug:koSlug, onSelect:setKoSlug},
          {title:'영문 폰트', fonts:enFonts, slug:enSlug, onSelect:setEnSlug},
        ].map(({title,fonts,slug,onSelect})=>(
          <div key={title}>
            <h3 className="text-sm font-medium mb-3" style={{color:'var(--text-muted)'}}>{title}</h3>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {fonts.map(f=>(
                <button key={f.slug} onClick={()=>onSelect(f.slug)}
                  className="w-full text-left px-4 py-3 rounded-xl transition-all"
                  style={{
                    background:slug===f.slug?'rgba(30,144,255,0.12)':'rgba(255,255,255,0.2)',
                    border:`1px solid ${slug===f.slug?'var(--accent)':'var(--border)'}`,
                    color:slug===f.slug?'var(--accent)':'var(--text-secondary)',
                  }}>
                  <span className="text-sm font-medium">{f.name}</span>
                  <span className="text-xs ml-2 opacity-60">{f.category}</span>
                </button>
              ))}
              {fonts.length===0 && (
                <p className="text-sm text-center py-4" style={{color:'var(--text-muted)'}}>로딩 중...</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
