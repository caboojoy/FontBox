'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Eye, Check, RefreshCw, X } from 'lucide-react'
import { fontsDb as supabase } from '@/lib/supabase'
import { Font } from '@/types'
import { addFont, deleteFont, updateFont, getFontStats } from '@/actions/fonts'

const CATEGORIES = [
  'gothic','myeongjo','handwriting','display','monospace',
  'sans-serif','serif','script','slab-serif',
]

const defaultForm = {
  name:'', slug:'', designer:'', foundry:'',
  category:'gothic', tags:'',
  license:'ofl' as Font['license'],
  is_commercial:true,
  cdn_url:'', css_family:'', weights:'400,700',
  preview_ko:'', preview_en:'',
  language:'korean' as Font['language'],
  supports_korean:true, supports_latin:false, is_featured:false,
}

export default function AdminPage() {
  const [fonts, setFonts]   = useState<Font[]>([])
  const [stats, setStats]   = useState({ total:0, korean:0, english:0, both:0, featured:0 })
  const [form, setForm]     = useState(defaultForm)
  const [tab, setTab]       = useState<'list'|'add'>('list')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]       = useState<{type:'ok'|'err';text:string}|null>(null)
  const [previewLoaded, setPreviewLoaded] = useState(false)
  const [deleting, setDeleting] = useState<string|null>(null)

  const set = (k:string, v:unknown) => setForm(p => ({...p,[k]:v}))

  useEffect(() => {
    set('slug', form.name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,''))
  }, [form.name])

  useEffect(() => {
    if (!form.cdn_url) return
    setPreviewLoaded(false)
    const link = document.createElement('link')
    link.rel='stylesheet'; link.href=form.cdn_url
    link.onload = () => setPreviewLoaded(true)
    document.head.appendChild(link)
    return () => { try{document.head.removeChild(link)}catch{} }
  }, [form.cdn_url])

  const loadData = useCallback(async () => {
    const {data} = await supabase.from('fonts').select('*').order('created_at',{ascending:false})
    setFonts((data as Font[])||[])
    const s = await getFontStats()
    setStats(s)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleSave = async () => {
    if (!form.name||!form.cdn_url||!form.css_family) {
      setMsg({type:'err',text:'이름, CDN URL, CSS Family는 필수입니다.'}); return
    }
    setSaving(true)
    const result = await addFont({
      name:form.name, slug:form.slug,
      designer:form.designer||undefined, foundry:form.foundry||undefined,
      category:form.category,
      tags:form.tags.split(',').map(t=>t.trim()).filter(Boolean),
      license:form.license, is_commercial:form.is_commercial,
      cdn_url:form.cdn_url, css_family:form.css_family,
      weights:form.weights.split(',').map(w=>w.trim()).filter(Boolean),
      preview_ko:form.preview_ko||undefined,
      preview_en:form.preview_en||undefined,
      language:form.language,
      supports_korean:form.supports_korean,
      supports_latin:form.supports_latin,
      is_featured:form.is_featured,
    } as Parameters<typeof addFont>[0])

    if (result.success) {
      setMsg({type:'ok',text:`✅ "${form.name}" 추가 완료! 사이트에 즉시 반영됩니다.`})
      setForm(defaultForm); loadData(); setTab('list')
    } else {
      setMsg({type:'err',text:result.error||'저장 실패'})
    }
    setSaving(false)
    setTimeout(()=>setMsg(null), 5000)
  }

  const handleDelete = async (f:Font) => {
    if (!confirm(`"${f.name}" 폰트를 삭제하시겠습니까?`)) return
    setDeleting(f.id)
    await deleteFont(f.id)
    loadData(); setDeleting(null)
  }

  const handleToggleFeatured = async (f:Font) => {
    await updateFont(f.id,{is_featured:!f.is_featured})
    loadData()
  }

  const previewText = form.language==='english'
    ? (form.preview_en||'The quick brown fox')
    : (form.preview_ko||'다람쥐 헌 쳇바퀴에 타고파')

  return (
    <div style={{ maxWidth: 1152, margin: "0 auto", padding: "96px 24px 80px" }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{color:'var(--text-primary)'}}>폰트 관리</h1>
          <div className="flex gap-5 text-sm" style={{color:'var(--text-muted)'}}>
            {[
              ['전체',stats.total,'var(--accent)'],
              ['한글',stats.korean,''],
              ['영문',stats.english,''],
              ['한+영',stats.both,''],
              ['추천',stats.featured,''],
            ].map(([l,v,c])=>(
              <span key={l as string}>{l as string} <strong style={{color:(c as string)||'var(--text-secondary)'}}>{v as number}</strong></span>
            ))}
          </div>
        </div>
        <button onClick={loadData}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:bg-white/30 transition-all"
          style={{color:'var(--text-muted)'}}>
          <RefreshCw size={14}/> 새로고침
        </button>
      </div>

      {msg && (
        <div className="mb-6 px-4 py-3 rounded-xl text-sm flex items-center justify-between animate-fade-in"
          style={{
            background: msg.type==='ok'?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)',
            border:`1px solid ${msg.type==='ok'?'rgba(34,197,94,0.3)':'rgba(239,68,68,0.3)'}`,
            color: msg.type==='ok'?'#16a34a':'#dc2626',
          }}>
          {msg.text}
          <button onClick={()=>setMsg(null)}><X size={14}/></button>
        </div>
      )}

      <div className="flex gap-2 mb-8">
        {[{v:'list',label:`목록 (${stats.total})`},{v:'add',label:'+ 새 폰트 추가'}].map(t=>(
          <button key={t.v} onClick={()=>setTab(t.v as 'list'|'add')}
            className={`filter-btn ${tab===t.v?'active':''}`}>{t.label}</button>
        ))}
      </div>

      {/* 목록 */}
      {tab==='list' && (
        <div className="space-y-2 animate-fade-in">
          {fonts.map(f=>(
            <div key={f.id} className="flex items-center justify-between p-4 rounded-xl"
              style={{background:'rgba(255,255,255,0.25)',border:'1px solid var(--border)'}}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="font-medium text-sm truncate" style={{color:'var(--text-primary)'}}>{f.name}</span>
                <span className="text-xs opacity-60 hidden sm:inline" style={{color:'var(--text-muted)'}}>
                  {f.category} · {f.language} · {f.license}
                </span>
                {f.is_featured && (
                  <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{background:'rgba(30,144,255,0.12)',color:'var(--accent)'}}>추천</span>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={()=>handleToggleFeatured(f)} title="추천 토글"
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/40 transition-all"
                  style={{color:f.is_featured?'var(--accent)':'var(--text-muted)'}}>
                  <Check size={14}/>
                </button>
                <button onClick={()=>handleDelete(f)} disabled={deleting===f.id}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-100 transition-all"
                  style={{color:'#dc2626'}}>
                  {deleting===f.id?<RefreshCw size={14} className="animate-spin"/>:<Trash2 size={14}/>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 추가 폼 */}
      {tab==='add' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
          <div className="space-y-4">
            <h2 className="font-semibold" style={{color:'var(--text-primary)'}}>폰트 정보 입력</h2>
            {[
              {label:'폰트 이름 *',key:'name',placeholder:'Noto Sans KR'},
              {label:'Slug (자동생성)',key:'slug',placeholder:'noto-sans-kr'},
              {label:'디자이너',key:'designer',placeholder:'Google'},
              {label:'제작사',key:'foundry',placeholder:'Google Fonts'},
              {label:'CDN URL *',key:'cdn_url',placeholder:'https://fonts.googleapis.com/css2?family=...'},
              {label:'CSS Family *',key:'css_family',placeholder:'Noto Sans KR'},
              {label:'굵기 (콤마)',key:'weights',placeholder:'300,400,700'},
              {label:'태그 (콤마)',key:'tags',placeholder:'고딕,본문,깔끔'},
              {label:'한글 미리보기',key:'preview_ko',placeholder:'다람쥐 헌 쳇바퀴에 타고파'},
              {label:'영문 미리보기',key:'preview_en',placeholder:'The quick brown fox...'},
            ].map(({label,key,placeholder})=>(
              <div key={key}>
                <label className="block text-xs font-medium mb-1" style={{color:'var(--text-muted)'}}>{label}</label>
                <input type="text"
                  value={(form as Record<string,unknown>)[key] as string}
                  onChange={e=>set(key,e.target.value)}
                  placeholder={placeholder}
                  className="search-input w-full px-3 py-2 text-sm"
                  style={{color:'var(--text-primary)'}}/>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              {[
                {label:'카테고리',key:'category',options:CATEGORIES.map(c=>({v:c,l:c}))},
                {label:'언어',key:'language',options:[{v:'korean',l:'한글'},{v:'english',l:'English'},{v:'both',l:'한+영'}]},
                {label:'라이선스',key:'license',options:[{v:'ofl',l:'OFL'},{v:'free',l:'무료'},{v:'commercial-free',l:'상업무료'},{v:'apache-2',l:'Apache'}]},
              ].map(({label,key,options})=>(
                <div key={key}>
                  <label className="block text-xs font-medium mb-1" style={{color:'var(--text-muted)'}}>{label}</label>
                  <select value={(form as Record<string,unknown>)[key] as string}
                    onChange={e=>{
                      set(key,e.target.value)
                      if(key==='language'){
                        set('supports_korean',e.target.value!=='english')
                        set('supports_latin',e.target.value!=='korean')
                      }
                    }}
                    className="search-input w-full px-3 py-2 text-sm" style={{color:'var(--text-primary)'}}>
                    {options.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
                  </select>
                </div>
              ))}
              <div className="flex items-end gap-4 pb-1">
                {[{key:'is_commercial',label:'상업이용'},{key:'is_featured',label:'추천'}].map(({key,label})=>(
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox"
                      checked={(form as Record<string,unknown>)[key] as boolean}
                      onChange={e=>set(key,e.target.checked)} className="accent-sky-accent"/>
                    <span className="text-sm" style={{color:'var(--text-secondary)'}}>{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <button onClick={handleSave} disabled={saving}
              className="w-full py-3 rounded-xl font-medium text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{background:'var(--accent)',color:'white'}}>
              {saving
                ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/>저장 중...</>
                : <><Plus size={15}/>Supabase에 저장 (즉시 반영)</>}
            </button>
          </div>

          <div className="space-y-4">
            <div className="font-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Eye size={14} style={{color:'var(--text-muted)'}}/>
                <span className="text-sm font-medium" style={{color:'var(--text-muted)'}}>실시간 미리보기</span>
                {previewLoaded && <span className="text-xs text-green-500 ml-auto">✓ 로드됨</span>}
              </div>
              <div style={{
                fontFamily:previewLoaded&&form.css_family?`'${form.css_family}',sans-serif`:'inherit',
                fontSize:'32px',color:'var(--text-primary)',lineHeight:1.3,
                minHeight:'50px',opacity:previewLoaded?1:0.4,transition:'opacity 0.3s',
              }}>
                {form.name||'이름을 입력하세요'}
              </div>
              <div style={{
                fontFamily:previewLoaded&&form.css_family?`'${form.css_family}',sans-serif`:'inherit',
                fontSize:'18px',color:'var(--text-secondary)',marginTop:'12px',
                opacity:previewLoaded?1:0.4,
              }}>
                {previewText}
              </div>
            </div>

            <div className="p-4 rounded-xl text-sm"
              style={{background:'rgba(30,144,255,0.06)',border:'1px solid rgba(30,144,255,0.15)'}}>
              <p className="font-medium mb-2" style={{color:'var(--accent)'}}>💡 저장하면 즉시 반영</p>
              <ul className="space-y-1 text-xs" style={{color:'var(--text-muted)',listStyle:'disc',paddingLeft:'16px'}}>
                <li>git push, 재배포 완전 불필요</li>
                <li>Supabase 대시보드 Table Editor에서도 직접 추가 가능</li>
                <li>Google Fonts 새 폰트 → CDN URL 붙여넣기 → 저장</li>
              </ul>
            </div>

            <div className="p-3 rounded-xl text-xs font-mono"
              style={{background:'rgba(0,0,0,0.05)',border:'1px solid var(--border)',color:'var(--text-muted)'}}>
              <p className="font-sans font-medium mb-1" style={{color:'var(--text-secondary)'}}>Google Fonts URL 패턴</p>
              <p>fonts.googleapis.com/css2?family=<span style={{color:'var(--accent)'}}>폰트명+치환</span>:wght@<span style={{color:'var(--accent)'}}>400;700</span>&display=swap</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
