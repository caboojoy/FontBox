'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Moon, Sun, Heart, Sparkles, Menu, X, Type } from 'lucide-react'
import { useTheme } from 'next-themes'

export default function Navbar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setMounted(true)
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { href: '/', label: '폰트 모음' },
    { href: '/pairing', label: '페어링' },
    { href: '/ai', label: 'AI 추천', icon: Sparkles },
    { href: '/favorites', label: '즐겨찾기', icon: Heart },
    { href: '/admin', label: '관리' },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'nav-blur shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-sky-accent flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Type size={16} className="text-white" />
            </div>
            <span
              className="font-display font-semibold text-lg"
              style={{ color: 'var(--text-primary)' }}
            >
              FontBox
            </span>
          </Link>

          {/* 데스크탑 네비 */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-sky-accent text-white shadow-sm'
                      : 'hover:bg-white/30'
                  }`}
                  style={{ color: active ? 'white' : 'var(--text-secondary)' }}
                >
                  {Icon && <Icon size={14} />}
                  {label}
                </Link>
              )
            })}
          </div>

          {/* 다크모드 토글 + 모바일 메뉴 */}
          <div className="flex items-center gap-2">
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-white/30"
                style={{ color: 'var(--text-secondary)' }}
                aria-label="다크모드 전환"
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            )}

            {/* 모바일 메뉴 버튼 */}
            <button
              className="md:hidden w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/30"
              style={{ color: 'var(--text-secondary)' }}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {menuOpen && (
          <div
            className="md:hidden py-3 pb-4 border-t animate-fade-in"
            style={{ borderColor: 'var(--border)' }}
          >
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl mx-1 text-sm font-medium transition-all ${
                    active ? 'bg-sky-accent text-white' : 'hover:bg-white/30'
                  }`}
                  style={{ color: active ? 'white' : 'var(--text-secondary)' }}
                >
                  {Icon && <Icon size={15} />}
                  {label}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </nav>
  )
}
