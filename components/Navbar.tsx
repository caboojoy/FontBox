'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Heart, Sparkles, Menu, X, Type } from 'lucide-react'
import Image from 'next/image'


export default function Navbar() {
  const pathname  = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { href: '/',         label: '폰트 모음' },
    { href: '/pairing',  label: '페어링' },
    { href: '/ai',       label: 'AI 추천',  icon: Sparkles },
    { href: '/favorites',label: '즐겨찾기', icon: Heart },
    { href: '/admin',    label: '관리' },
  ]

  return (
    <nav style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 50,
      background: scrolled ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.7)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: scrolled ? '1px solid #e2e8f0' : '1px solid transparent',
      transition: 'all 0.3s ease',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

          {/* 로고 */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <Image
              src="/caboo_blue_02.png"
              alt="FontBox 로고"
              width={32}
              height={32}
              style={{ borderRadius: 8 }}
            />
            <span style={{ fontWeight: 700, fontSize: 17, color: '#0f172a', letterSpacing: '-0.01em' }}>
              FontBox
            </span>
          </Link>

          {/* 데스크탑 네비 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}
               className="hidden md:flex">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <Link key={href} href={href} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '7px 14px', borderRadius: 100,
                  fontSize: 14, fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  background: active ? '#1E90FF' : 'transparent',
                  color: active ? '#ffffff' : '#475569',
                  boxShadow: active ? '0 2px 8px rgba(30,144,255,0.3)' : 'none',
                }}>
                  {Icon && <Icon size={13} />}
                  {label}
                </Link>
              )
            })}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <button
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              border: '1px solid #e2e8f0', background: '#f8fafc',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#475569',
            }}
          >
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* 모바일 메뉴 */}
        {menuOpen && (
          <div style={{
            paddingBottom: 12,
            borderTop: '1px solid #f1f5f9',
          }}>
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <Link key={href} href={href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 12px', borderRadius: 10, margin: '2px 0',
                    fontSize: 14, fontWeight: 500, textDecoration: 'none',
                    background: active ? '#1E90FF' : 'transparent',
                    color: active ? '#ffffff' : '#475569',
                  }}
                >
                  {Icon && <Icon size={14} />}
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
