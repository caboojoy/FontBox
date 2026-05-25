'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, ArrowRight } from 'lucide-react'
import { fontsDb as supabase } from '@/lib/supabase'
import { Font } from '@/types'
import FontCard from '@/components/FontCard'

export default function FavoritesPage() {
  const [fonts, setFonts]       = useState<Font[]>([])
  const [loading, setLoading]   = useState(true)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    const loadFavorites = async () => {
      const saved = localStorage.getItem('fontbox_favorites')
      if (!saved) { setLoading(false); return }

      const slugs: string[] = JSON.parse(saved)
      setFavorites(new Set(slugs))

      if (slugs.length === 0) { setLoading(false); return }

      // slug 기반으로 조회 (id 아님)
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
      } else {
        next.add(fontSlug)
      }
      // Array.from 사용 — Set 스프레드 대신 명시적 변환
      localStorage.setItem('fontbox_favorites', JSON.stringify(Array.from(next)))
      return next
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <div className="mb-10 animate-fade-up">
        <div className="flex items-center gap-3 mb-2">
          <Heart size={22} className="fill-red-500 text-red-500" />
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>즐겨찾기</h1>
        </div>
        <p style={{ color: 'var(--text-muted)' }}>
          {fonts.length > 0 ? `${fonts.length}개의 폰트를 저장했습니다.` : '저장한 폰트가 없습니다.'}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton rounded-2xl h-52" />
          ))}
        </div>
      ) : fonts.length === 0 ? (
        <div className="text-center py-24 animate-fade-up">
          <p className="text-5xl mb-6">🤍</p>
          <p className="text-xl font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
            아직 저장한 폰트가 없어요
          </p>
          <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
            폰트 카드의 하트 버튼을 눌러 즐겨찾기에 추가하세요
          </p>
          <Link href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all hover:opacity-80"
            style={{ background: 'var(--accent)', color: 'white' }}>
            폰트 탐색하러 가기 <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-grid animate-fade-up">
          {fonts.map((font, i) => (
            <FontCard
              key={font.id}
              font={font}
              isFavorited={favorites.has(font.slug)}
              onToggleFavorite={handleToggleFavorite}
              animationDelay={i * 60}
            />
          ))}
        </div>
      )}
    </div>
  )
}
