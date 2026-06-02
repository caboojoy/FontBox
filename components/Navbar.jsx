'use client'

import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { label: '프로젝트', href: '#projects' },
  { label: 'AI 뉴스', href: '#news' },
  { label: '소개', href: '#about' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNavClick = (href) => {
    setMenuOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-brand-600/95 backdrop-blur-sm shadow-md'
          : 'bg-brand-600'
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* 로고 이미지 */}
        <a
          href="#"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center hover:opacity-80 transition-opacity"
        >
          <img
            src="/caboo_white_00.png"
            alt="caboo"
            className="h-8 w-auto"
          />
        </a>

        {/* 데스크톱 메뉴 */}
        <ul className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <li key={link.href}>
              <button
                onClick={() => handleNavClick(link.href)}
                className="text-brand-100 hover:text-white text-sm font-medium transition-colors"
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        {/* 모바일 햄버거 버튼 */}
        <button
          className="md:hidden text-white p-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="메뉴 열기"
        >
          {menuOpen ? (
            <X size={22} strokeWidth={1.5} />
          ) : (
            <Menu size={22} strokeWidth={1.5} />
          )}
        </button>
      </nav>

      {/* 모바일 드롭다운 메뉴 */}
      {menuOpen && (
        <div className="md:hidden bg-brand-700 border-t border-brand-500 px-4 py-3 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="block w-full text-left text-brand-100 hover:text-white text-sm py-1.5"
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </header>
  )
}
