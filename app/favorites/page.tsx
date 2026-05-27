'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Font } from '@/types'
import FontCard from '@/components/FontCard'

export default function FavoritesPage() {
  const [fonts, setFonts]         = useState<Font[]>([])
  const [loading, setLoading]     = useState(true)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    const loadFavorites = async () => {
      const saved = localStorage.getItem('fontbox_favorites')
      if (!saved) { setLoading(false); return }
      const slugs: string[] = JSON.parse(saved)
      setFavorites(new Set(slugs))
      if (slugs.length === 0) { setLoading(false); return }
      const { data } = await supabase.from('fonts').select('*').in('slug', slugs)
      setFonts((data as Font[]) || [])
      setLoading(false)
    }
    loadFavorites()
  }, [])

  const handleToggleFavorite = (fontSlug: string) => {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(fontSlug)) {
        next.delete(fontSlug)
        setFonts(f => f.filter(font => font.slug !== fontSlug))
      } else next.add(fontSlug)
      localStorage.setItem('fontbox_favorites', JSON.stringify(Array.from(next)))
      return next
    })
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 24px 80px' }}>

      {/* 헤더 */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Heart size={22} style={{ fill: '#ef4444', color: '#ef4444' }} />
          <h1 style={{ fontSize: 40, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            즐겨찾기
          </h1>
        </div>
        <p style={{ fontSize: 15, color: '#64748b' }}>
          {fonts.length > 0
            ? `${fonts.length}개의 폰트를 저장했습니다.`
            : '저장한 폰트가 없습니다.'}
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{
              height: 280, borderRadius: 16,
              background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)',
            }} />
          ))}
        </div>
      ) : fonts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>🤍</div>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
            아직 저장한 폰트가 없어요
          </p>
          <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 28 }}>
            폰트 카드의 하트 버튼을 눌러 즐겨찾기에 추가하세요
          </p>
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 24px', borderRadius: 100, fontSize: 14, fontWeight: 600,
            background: '#1E90FF', color: '#ffffff', textDecoration: 'none',
            boxShadow: '0 2px 12px rgba(30,144,255,0.3)',
          }}>
            폰트 탐색하러 가기 <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
          {fonts.map(font => (
            <FontCard
              key={font.id} font={font}
              isFavorited={favorites.has(font.slug)}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  )
}
