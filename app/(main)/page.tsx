const TRENDING = [
  {
    id: 1,
    category: "IT/과학",
    categoryClass: "text-secondary",
    title: "양자 컴퓨팅: 보안의 다음 도약",
    image: "https://picsum.photos/seed/quantum/320/320",
  },
  {
    id: 2,
    category: "문화",
    categoryClass: "text-secondary",
    title: "패스트 패션 시대, 전통 공예의 부활",
    image: "https://picsum.photos/seed/craft/320/320",
  },
  {
    id: 3,
    category: "정치",
    categoryClass: "text-secondary",
    title: "인도-태평양 지역의 외교적 변화와 전망",
    image: "https://picsum.photos/seed/diplomacy/320/320",
  },
];

const CATEGORIES = ["최신 뉴스", "사회 문제", "금융 및 시장", "IT / 과학", "지속 가능성", "모빌리티"];

const NEWS_GRID = [
  {
    id: 1,
    category: "금융",
    categoryClass: "bg-secondary-container text-on-secondary-container",
    title: "시장 변동성: 투자자가 이번 분기에 주목해야 할 요소",
    summary:
      "글로벌 시장이 인플레이션 압박으로 인한 스트레스 징후를 보이며, 중앙은행들이 현재의 금리 전략을 재검토하게 만들고 있습니다.",
    time: "4시간 전",
    image: "https://picsum.photos/seed/finance-chart/800/480",
  },
  {
    id: 2,
    category: "IT / 과학",
    categoryClass: "bg-tertiary-container text-on-tertiary-container",
    title: "실리콘 시프트: 기존 체제에 도전하는 새로운 설계",
    summary:
      "새롭게 설계된 맞춤형 칩들이 거대한 효율성 향상을 약속하며, 수십 년간 이어온 전통적 컴퓨팅 거물들의 독점을 끝낼 잠재력을 보여주고 있습니다.",
    time: "6시간 전",
    image: "https://picsum.photos/seed/silicon-chip/800/480",
  },
  {
    id: 3,
    category: "사회",
    categoryClass: "bg-primary-container text-on-primary-container",
    title: "업무 환경의 재정의: 2026년 하이브리드 트렌드",
    summary:
      "기업들이 생산성과 사기를 유지하기 위해 물리적 존재감과 디지털의 원활함을 결합한 '피지털(phygital)' 워크스페이스를 점점 더 많이 도입하고 있습니다.",
    time: "8시간 전",
    image: "https://picsum.photos/seed/office-work/800/480",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ── 히어로 + 인기 사이드바 ── */}
      <section className="grid grid-cols-1 lg:grid-cols-10 gap-gutter mb-stack-lg">

        {/* 메인 히어로 (70%) */}
        <div className="lg:col-span-7 relative group overflow-hidden rounded-xl shadow-md h-[500px]">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: "url('https://picsum.photos/seed/metro-city/1200/600')" }}
          />
          <div className="absolute inset-0 hero-gradient" />
          <div className="absolute bottom-0 left-0 p-stack-lg text-white">
            <span className="inline-block px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed text-caption-tiny rounded-full mb-stack-sm">
              글로벌 경제
            </span>
            <h1 className="text-headline-lg mb-stack-sm max-w-2xl leading-tight">
              디지털 시대, 메트로폴리탄 인프라의 미래를 설계하다
            </h1>
            <p className="text-body-md text-white/80 max-w-xl">
              새로운 기술적 진보가 도시 자원 관리 방식을 재편하며 더 똑똑한 도시 확장을 위해
              지속 가능성과 상호 연결된 지능을 우선시하고 있습니다.
            </p>
          </div>
        </div>

        {/* 실시간 인기 사이드바 (30%) */}
        <aside className="lg:col-span-3 space-y-stack-md">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-headline-md text-primary">실시간 인기 뉴스</h2>
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              trending_up
            </span>
          </div>
          <div className="space-y-stack-md">
            {TRENDING.map((item) => (
              <div
                key={item.id}
                className="flex gap-stack-md p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/30 hover:shadow-sm transition-all group cursor-pointer active:scale-95 duration-150"
              >
                <div className="flex-1">
                  <span className={`text-label-sm ${item.categoryClass}`}>{item.category}</span>
                  <h3 className="text-body-lg text-on-surface line-clamp-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                </div>
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      {/* ── 카테고리 필터 ── */}
      <div className="flex items-center gap-stack-sm overflow-x-auto no-scrollbar pb-stack-md mb-stack-lg border-b border-outline-variant/30">
        {CATEGORIES.map((cat, i) => (
          <button
            key={cat}
            className={`px-stack-md py-2 rounded-full text-label-md whitespace-nowrap transition-all active:scale-95 ${
              i === 0
                ? "bg-primary text-on-primary shadow-md"
                : "bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── 뉴스 그리드 ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter pb-stack-lg">
        {NEWS_GRID.map((article) => (
          <article
            key={article.id}
            className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow group flex flex-col cursor-pointer"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className={`absolute top-3 left-3 px-2 py-1 rounded text-caption-tiny ${article.categoryClass}`}>
                {article.category}
              </div>
            </div>
            <div className="p-card-padding flex flex-col flex-grow">
              <h4 className="text-headline-md text-on-surface mb-2 group-hover:text-secondary transition-colors line-clamp-2">
                {article.title}
              </h4>
              <p className="text-body-md text-on-surface-variant mb-stack-md line-clamp-3">
                {article.summary}
              </p>
              <div className="mt-auto pt-stack-md border-t border-outline-variant/30 flex justify-between items-center">
                <span className="text-label-sm text-outline">{article.time}</span>
                <button className="text-outline hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-xl">bookmark</span>
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
