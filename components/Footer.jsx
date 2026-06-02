const footerLinks = [
  { label: '프로젝트', href: '#projects' },
  { label: 'AI 뉴스', href: '#news' },
  { label: '소개', href: '#about' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-brand-600">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* 로고 이미지 */}
          <div>
            <img
              src="/caboo_white_00.png"
              alt="caboo"
              className="h-8 w-auto"
            />
          </div>

          {/* 링크 */}
          <nav className="flex gap-5 flex-wrap justify-center">
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-brand-200 hover:text-white text-sm transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

        </div>

        {/* 구분선 */}
        <div className="border-t border-brand-500 mt-8 pt-6 text-center">
          <p className="text-brand-400 text-xs">
            © {year} caboo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
