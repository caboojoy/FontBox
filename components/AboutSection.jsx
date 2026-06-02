const techStack = [
  { group: '개발 도구', items: ['Cursor AI', 'Claude Code', 'VS Code', 'GitHub'] },
  { group: '프론트엔드', items: ['Next.js', 'React', 'Tailwind CSS', 'HTML/CSS'] },
  { group: '백엔드·DB', items: ['AWS', 'Supabase', 'PostgreSQL', 'Python'] },
  { group: 'AI·자동화', items: ['Claude API', 'Make', 'GitHub Actions', 'n8n'] },
]

import { Bot, Zap, Rocket, Mail } from 'lucide-react'

const highlights = [
  {
    icon: Bot,
    title: 'AI가 설계하는 도구',
    desc: 'Claude AI가 직접 설계·개발하고 실무가 검증하는 솔루션',
  },
  {
    icon: Zap,
    title: 'AI 기반 자동화',
    desc: '반복 업무를 AI가 대신 처리 — 사람은 판단에만 집중',
  },
  {
    icon: Rocket,
    title: 'AI 1인 사업 모델',
    desc: '2026년 AI 전문 소프트웨어 1인 사업 런칭 목표',
  },
]

export default function AboutSection() {
  return (
    <section id="about" className="bg-white">
      <div className="section-container">

        {/* 섹션 헤더 */}
        <h2 className="section-title">소개</h2>
        <p className="section-subtitle">caboo를 움직이는 AI와 사람</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-4">

          {/* 좌: 소개 텍스트 */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              {/* 아바타 */}
              <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                도
              </div>
              <div>
                <div className="font-semibold text-slate-800 text-lg">caboo</div>
                <div className="text-sm text-slate-500">AI 솔루션 개발자</div>
              </div>
            </div>

            <p className="text-slate-600 text-sm leading-7 mb-6">
              AI가 직접 설계하고, 실무 경험이 검증하는 도구들을 만듭니다.
              자동화·분석·회계·비즈니스 전 영역에서
              AI가 반복 업무를 대신하고, 사람은 판단에 집중할 수 있도록 합니다.
              <br /><br />
              Claude AI를 핵심 엔진으로 차별화된 AI 솔루션을 1인 스튜디오에서 개발하고 있습니다.
            </p>

            {/* 하이라이트 카드 */}
            <div className="space-y-3">
              {highlights.map((h) => (
                <div
                  key={h.title}
                  className="flex items-start gap-3 p-3 bg-brand-50 rounded-xl border border-brand-100"
                >
                  <div className={`w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <h.icon size={16} strokeWidth={1.5} className="text-brand-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-700">{h.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{h.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 우: 기술 스택 */}
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-5">
              Tech Stack
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {techStack.map((group) => (
                <div key={group.group} className="bg-brand-50 rounded-xl border border-brand-100 p-4">
                  <div className="text-xs font-semibold text-brand-600 mb-3 uppercase tracking-wider">
                    {group.group}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {group.items.map((item) => (
                      <span
                        key={item}
                        className="px-2 py-0.5 bg-white border border-brand-200 rounded-md text-xs text-slate-600"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* 이메일 문의 */}
            <div className="mt-5">
              <a
                href="mailto:caboojoy@gmail.com"
                className="btn-outline text-xs px-5 py-2.5"
              >
                <Mail size={14} strokeWidth={1.5} />
                이메일 문의 · caboojoy@gmail.com
              </a>
            </div>

          </div>

        </div>
      </div>
    </section>
  )
}
