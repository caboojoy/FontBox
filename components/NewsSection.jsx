import { Bot, ChevronRight, ExternalLink } from 'lucide-react'

const CATEGORIES = [
  { label: 'LLM', color: 'bg-violet-100 text-violet-700' },
  { label: '이미지 AI', color: 'bg-pink-100 text-pink-700' },
  { label: '자율주행', color: 'bg-amber-100 text-amber-700' },
  { label: '로보틱스', color: 'bg-green-100 text-green-700' },
  { label: '규제·정책', color: 'bg-blue-100 text-blue-700' },
  { label: '스타트업', color: 'bg-orange-100 text-orange-700' },
]

// TODO: Supabase 연동 후 실제 데이터로 교체
// summary: Claude API가 기승전결 4단계로 구조화하여 생성
const PLACEHOLDER_NEWS = [
  {
    id: 1,
    title: 'Claude 4 출시 — 멀티모달 추론 성능 대폭 향상',
    summary: [
      { step: '기', text: 'OpenAI GPT 시리즈가 AI 시장을 주도하는 가운데, Anthropic은 안전성과 성능을 동시에 잡겠다는 목표로 Claude 시리즈를 꾸준히 발전시켜 왔습니다.' },
      { step: '승', text: 'Anthropic이 최신 모델 Claude 4를 공식 출시했습니다. 텍스트·이미지·코드를 동시에 처리하는 멀티모달 능력이 이전 버전 대비 40% 향상되었고, 수학·과학 벤치마크에서 GPT-4o를 처음으로 앞질렀습니다. 특히 긴 문서 분석과 복합 추론에서 압도적인 차이를 보였습니다.' },
      { step: '전', text: '주목할 점은 성능 향상과 함께 API 가격을 20% 인하했다는 것입니다. 기업 고객이 비용 부담 없이 고성능 AI를 도입할 수 있게 되면서, GPT 대신 Claude를 선택하는 기업이 빠르게 늘고 있습니다.' },
      { step: '결', text: 'AI 모델 경쟁이 성능에서 가격·안전성으로 확대되고 있습니다. Claude 4 출시로 Anthropic은 OpenAI와 Google에 맞서는 확실한 3강 구도를 굳혔으며, 국내 기업들의 AI 도입 선택지도 한층 넓어졌습니다.' },
    ],
    source: 'Anthropic Blog',
    category: 'LLM',
    catColor: 'bg-violet-100 text-violet-700',
    time: '2시간 전',
    url: 'https://www.anthropic.com',
  },
  {
    id: 2,
    title: 'Midjourney v7 한국어 프롬프트 완전 지원 시작',
    summary: [
      { step: '기', text: 'Midjourney는 전 세계 크리에이터들이 가장 많이 사용하는 이미지 생성 AI입니다. 그러나 영어 프롬프트만 정확히 인식해, 한국·중국·일본 등 비영어권 사용자는 번역을 거쳐야 하는 불편함이 있었습니다.' },
      { step: '승', text: 'Midjourney v7 업데이트로 한국어를 포함한 15개 언어 프롬프트가 공식 지원됩니다. "붉은 노을 아래 한옥 마을"처럼 한국어 그대로 입력해도 의도에 맞는 이미지가 생성되며, 한국 특유의 색감·구도 표현도 크게 개선되었습니다.' },
      { step: '전', text: '완벽하지는 않습니다. 한국어 고유 감성 표현(예: "정겹다", "아련하다")은 아직 부정확하게 해석되는 경우가 있습니다. 그럼에도 영어 번역 없이 바로 사용 가능한 수준에 도달했다는 평가입니다.' },
      { step: '결', text: '국내 디자이너·유튜버·마케터들의 AI 이미지 도구 진입 장벽이 크게 낮아졌습니다. 한국어 지원으로 국내 사용자 수가 3개월 내 2배 이상 증가할 것으로 업계는 전망합니다.' },
    ],
    source: 'The Verge',
    category: '이미지 AI',
    catColor: 'bg-pink-100 text-pink-700',
    time: '4시간 전',
    url: 'https://www.theverge.com',
  },
  {
    id: 3,
    title: 'EU AI Act 세부 가이드라인 초안 공개 — 기업 대응 방향은',
    summary: [
      { step: '기', text: '2024년 발효된 EU AI Act는 AI를 위험 등급별로 규제하는 세계 최초의 포괄적 AI 법률입니다. 그러나 세부 실행 기준이 불명확해 기업들이 어떻게 준비해야 할지 몰라 혼란이 이어졌습니다.' },
      { step: '승', text: 'EU 집행위원회가 드디어 세부 가이드라인 초안을 공개했습니다. 핵심 내용은 ▲채용·의료·금융 AI는 반드시 인간 감독관 지정 ▲학습 데이터 출처 전면 공개 ▲고위험 AI 시스템 연간 감사 의무화입니다. 위반 시 전 세계 연간 매출의 최대 3% 과징금이 부과됩니다.' },
      { step: '전', text: '삼성·LG·카카오·네이버 등 EU에 AI 서비스를 제공하는 국내 기업도 직접 적용 대상입니다. 특히 HR AI 솔루션을 유럽에 수출하는 국내 스타트업은 즉시 대응이 필요한 상황입니다.' },
      { step: '결', text: '규제 준수 비용이 단기적으로 기업 부담을 높이겠지만, 장기적으로는 신뢰할 수 있는 AI 서비스가 유럽 시장에서 경쟁 우위를 갖게 됩니다. 국내 기업은 지금부터 컴플라이언스 체계를 준비하는 것이 유리합니다.' },
    ],
    source: 'TechCrunch',
    category: '규제·정책',
    catColor: 'bg-blue-100 text-blue-700',
    time: '6시간 전',
    url: 'https://techcrunch.com',
  },
  {
    id: 4,
    title: '테슬라 FSD v13 전국 롤아웃 — 자율주행 레벨 3 사실상 도달',
    summary: [
      { step: '기', text: '테슬라는 수년간 "완전 자율주행(FSD)"을 약속해 왔지만, 실제로는 운전자가 항상 핸들을 잡아야 하는 레벨 2 수준에 머물러 있다는 비판을 받아 왔습니다.' },
      { step: '승', text: 'FSD v13이 미국 전역에 배포되기 시작했습니다. 신경망 처리 속도가 5배 빨라졌고, 비보호 좌회전·복잡한 로터리·끼어들기 상황에서도 개입 없이 주행을 완료하는 영상이 잇따라 공개됩니다. 테슬라 내부 데이터에 따르면 인간 개입 빈도가 v12 대비 73% 감소했습니다.' },
      { step: '전', text: '일론 머스크는 "사실상 레벨 3 달성"이라고 밝혔지만, 규제 당국의 공식 인증은 아직 없습니다. 또한 야간·악천후·공사 구간에서는 여전히 오작동 사례가 보고되고 있어 완전한 신뢰는 이르다는 시각도 있습니다.' },
      { step: '결', text: '자율주행 기술이 실용화의 마지막 단계에 진입했다는 신호입니다. 테슬라 주가는 소식 발표 후 4% 상승했으며, 국내 현대차·카카오모빌리티 등도 자사 자율주행 로드맵 가속화를 검토하고 있습니다.' },
    ],
    source: 'Reuters',
    category: '자율주행',
    catColor: 'bg-amber-100 text-amber-700',
    time: '8시간 전',
    url: 'https://www.reuters.com',
  },
  {
    id: 5,
    title: 'OpenAI, 한국 스타트업 파트너십 프로그램 발표',
    summary: [
      { step: '기', text: 'OpenAI는 미국·영국·일본 등 주요 국가에서 스타트업 지원 프로그램을 운영해 왔습니다. 그러나 한국 시장은 상대적으로 소외되어 국내 AI 창업자들의 아쉬움이 컸습니다.' },
      { step: '승', text: 'OpenAI가 공식 한국 파트너십 프로그램을 발표했습니다. 1차 선발 20개 팀에게 ▲GPT-4o API 크레딧 5,000만 원 상당 ▲OpenAI 엔지니어 1:1 기술 멘토링 ▲실리콘밸리 IR 연계 기회가 제공됩니다. 지원 마감은 다음 달 말입니다.' },
      { step: '전', text: '단순 지원을 넘어 OpenAI가 한국을 아시아 거점으로 삼겠다는 전략적 신호로 읽힙니다. 삼성벤처투자·카카오벤처스가 프로그램 공동 스폰서로 참여해 투자 연계 가능성도 열려 있습니다.' },
      { step: '결', text: 'AI 창업을 준비하는 팀이라면 반드시 검토할 기회입니다. 특히 GPT 기반 B2B SaaS, 헬스케어 AI, 교육 AI 분야 팀에 대한 선호가 높다고 알려져 있어 해당 분야 창업자의 적극적인 지원이 기대됩니다.' },
    ],
    source: 'Forbes',
    category: '스타트업',
    catColor: 'bg-orange-100 text-orange-700',
    time: '10시간 전',
    url: 'https://www.forbes.com',
  },
]

export default function NewsSection() {
  return (
    <section id="news" className="bg-brand-50">
      <div className="section-container">

        {/* 섹션 헤더 */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="section-title">세계 AI 뉴스</h2>
            <p className="section-subtitle">
              하루 3~4회 자동 수집 · Claude API 한국어 요약 · 원문 링크 제공
            </p>
          </div>
          <a href="#" className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
            전체 보기
            <ChevronRight size={14} strokeWidth={2} />
          </a>
        </div>

        {/* AI 뉴스 메인 카드 */}
        <div className="bg-white border border-brand-200 rounded-2xl overflow-hidden shadow-sm">

          {/* 카드 헤더 */}
          <div className="bg-brand-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Bot size={18} strokeWidth={1.5} className="text-white" />
              </div>
              <div>
                <div className="text-white text-sm font-semibold">ai-news-bot</div>
                <div className="text-brand-200 text-xs">하루 3~4회 자동 수집 · 자동 포스팅</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-brand-200 text-xs">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              LIVE
            </div>
          </div>

          {/* 카테고리 뱃지 바 */}
          <div className="px-6 py-3 border-b border-brand-100 flex gap-2 flex-wrap bg-brand-50">
            {CATEGORIES.map((cat) => (
              <span
                key={cat.label}
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${cat.color}`}
              >
                {cat.label}
              </span>
            ))}
          </div>

          {/* 뉴스 리스트 */}
          <div className="divide-y divide-slate-100">
            {PLACEHOLDER_NEWS.map((news, idx) => (
              <div key={news.id} className="px-6 py-6 hover:bg-brand-50 transition-colors">

                {/* 상단: 순번 + 카테고리 + 출처 + 시간 */}
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-xs text-slate-300 font-mono w-4 flex-shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${news.catColor}`}>
                    {news.category}
                  </span>
                  <span className="text-xs text-slate-400">{news.source}</span>
                  <span className="text-xs text-slate-300">·</span>
                  <span className="text-xs text-slate-400">{news.time}</span>
                </div>

                {/* 제목 */}
                <h3 className="text-base font-bold text-slate-800 leading-snug mb-4 pl-6">
                  {news.title}
                </h3>

                {/* 기승전결 요약 — 레이블 없이 단락으로 표시 */}
                <div className="pl-6 space-y-2 mb-4">
                  {news.summary.map((item) => (
                    <p key={item.step} className="text-sm text-slate-600 leading-relaxed">
                      {item.text}
                    </p>
                  ))}
                </div>

                {/* 원문 링크 버튼 */}
                <div className="pl-6">
                  <a
                    href={news.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-medium border border-brand-200 hover:border-brand-400 bg-white hover:bg-brand-50 rounded-full px-3 py-1.5 transition-colors"
                  >
                    <ExternalLink size={11} strokeWidth={2} />
                    원문 보기
                  </a>
                </div>

              </div>
            ))}
          </div>

          {/* 카드 푸터 */}
          <div className="px-6 py-3 bg-brand-50 border-t border-brand-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              📌 ai-news-bot 자동화 작업 진행 중 — Claude API 품질 필터 적용
            </span>
            <a href="#" className="text-xs text-brand-600 hover:text-brand-700 font-medium">
              뉴스 구독 →
            </a>
          </div>

        </div>
      </div>
    </section>
  )
}

