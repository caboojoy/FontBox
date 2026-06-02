'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import { projects, STATUS_LABEL, defaultVisible } from '../data/projects'

// 상태 뱃지 색상
const badgeClass = {
  done:     'badge-done',
  progress: 'badge-progress',
  plan:     'badge-plan',
  backlog:  'badge-backlog',
}

// 상태 점 색상
const dotColor = {
  done:     'bg-green-500',
  progress: 'bg-amber-400',
  plan:     'bg-brand-400',
  backlog:  'bg-slate-300',
}

const CATEGORIES = ['전체', '금융·회계', '자동화', 'AI서비스', '유틸리티']

function ProjectCard({ project }) {
  const isLinked = project.status === 'done' && project.url
  const isBacklog = project.status === 'backlog'

  // Lucide 아이콘 동적 렌더링
  const IconComponent = Icons[project.iconName] || Icons.Box

  const cardContent = (
    <div
      className={`card-base flex flex-col gap-3 h-full ${
        isBacklog ? 'opacity-55' : ''
      } ${isLinked ? 'cursor-pointer' : 'cursor-default'}`}
    >
      {/* 아이콘 */}
      <div className={`w-10 h-10 rounded-lg ${project.iconBg} flex items-center justify-center flex-shrink-0`}>
        <IconComponent size={20} strokeWidth={1.5} className={project.iconColor} />
      </div>

      {/* 이름 + 설명 */}
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-slate-800 mb-0.5">
          {project.name}
        </h3>
        <p className="text-xs text-slate-400 font-mono mb-1">{project.codeName}</p>
        <p className="text-xs text-slate-500 leading-relaxed">{project.description}</p>
      </div>

      {/* 하단: 상태 + 서브도메인 */}
      <div className="flex items-center justify-between">
        <span className={badgeClass[project.status]}>
          <span className={`w-1.5 h-1.5 rounded-full ${dotColor[project.status]}`} />
          {STATUS_LABEL[project.status]}
        </span>
        {project.subDomain && (
          <span className="text-xs text-slate-300 font-mono truncate max-w-[120px]">
            {project.subDomain}
          </span>
        )}
      </div>
    </div>
  )

  if (isLinked) {
    return (
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full no-underline"
      >
        {cardContent}
      </a>
    )
  }

  return <div className="h-full">{cardContent}</div>
}

export default function ProjectSection() {
  const [showAll, setShowAll] = useState(false)
  const [activeCategory, setActiveCategory] = useState('전체')

  const filtered = projects.filter((p) => {
    const categoryMatch = activeCategory === '전체' || p.category === activeCategory
    const visibilityMatch = showAll || defaultVisible(p)
    return categoryMatch && visibilityMatch
  })

  // 카테고리별 카운트 (전체 프로젝트 기준)
  const countByCategory = (cat) =>
    cat === '전체'
      ? projects.length
      : projects.filter((p) => p.category === cat).length

  const hiddenCount = projects.filter(
    (p) => !defaultVisible(p) && (activeCategory === '전체' || p.category === activeCategory)
  ).length

  return (
    <section id="projects" className="bg-white">
      <div className="section-container">

        {/* 섹션 헤더 */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="section-title">프로젝트</h2>
            <p className="section-subtitle">
              실무에서 시작된 {projects.length}개의 도구들
            </p>
          </div>
          {/* 전체/축소 토글 */}
          {!showAll && hiddenCount > 0 && (
            <button
              onClick={() => setShowAll(true)}
              className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
            >
              전체 보기 +{hiddenCount}
            </button>
          )}
          {showAll && (
            <button
              onClick={() => setShowAll(false)}
              className="text-sm text-slate-400 hover:text-slate-600 font-medium"
            >
              접기
            </button>
          )}
        </div>

        {/* 카테고리 필터 탭 */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-brand-600 text-white'
                  : 'bg-white border border-brand-200 text-slate-500 hover:border-brand-400 hover:text-brand-600'
              }`}
            >
              {cat}
              <span className="ml-1 opacity-60">({countByCategory(cat)})</span>
            </button>
          ))}
        </div>

        {/* 프로젝트 카드 그리드 */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in">
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400 text-sm">
            해당 카테고리에 표시할 프로젝트가 없습니다.
          </div>
        )}

        {/* 더 보기 버튼 (하단) */}
        {!showAll && hiddenCount > 0 && (
          <div className="text-center mt-10">
            <button
              onClick={() => setShowAll(true)}
              className="btn-outline"
            >
              백로그 프로젝트 {hiddenCount}개 더 보기
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
