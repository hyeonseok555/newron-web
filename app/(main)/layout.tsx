"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const DESKTOP_NAV = ["정치", "경제", "IT/과학", "문화"];

const BOTTOM_NAV = [
  { href: "/",          label: "홈",     icon: "home" },
  { href: "/briefing",  label: "브리핑", icon: "newspaper" },
  { href: "/lens",      label: "렌즈",   icon: "search" },
  { href: "/bookmarks", label: "북마크", icon: "bookmark" },
  { href: "/profile",   label: "프로필", icon: "account_circle" },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-on-surface">

      {/* ── 상단 헤더 ── */}
      <header className="fixed top-0 w-full z-50 bg-surface-container-lowest border-b border-outline-variant shadow-sm h-20">
        <div className="flex justify-between items-center px-container-margin h-20 max-w-screen-2xl mx-auto">

          {/* 로고 + 데스크탑 탭 */}
          <div className="flex items-center gap-stack-lg">
            <span className="text-2xl font-bold text-primary tracking-tight select-none">Newron</span>
            <nav className="hidden md:flex items-center gap-stack-md ml-stack-lg">
              {DESKTOP_NAV.map((item, i) => (
                <a
                  key={item}
                  href="#"
                  className={`text-label-md transition-colors duration-200 ${
                    i === 0
                      ? "text-primary font-bold border-b-2 border-primary pb-1"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  {item}
                </a>
              ))}
            </nav>
          </div>

          {/* 검색 + 계정 */}
          <div className="flex items-center gap-stack-md">
            <div className="relative hidden lg:block">
              <input
                className="bg-surface-container-low border-none rounded-full px-10 py-2 w-64 text-body-md focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="뉴스 검색..."
                type="text"
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
                search
              </span>
            </div>
            <button className="p-2 rounded-full hover:bg-surface-container-low transition-colors text-primary lg:hidden">
              <span className="material-symbols-outlined">search</span>
            </button>
            <button className="p-2 rounded-full hover:bg-surface-container-low transition-colors text-primary">
              <span className="material-symbols-outlined">account_circle</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── 본문 ── */}
      <main className="mt-20 pt-8 max-w-screen-2xl mx-auto px-container-margin pb-16 md:pb-20">
        {children}
      </main>

      {/* ── 푸터 ── */}
      <footer className="bg-surface-container-high border-t border-outline-variant w-full py-stack-lg mt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-stack-lg px-container-margin max-w-screen-2xl mx-auto">
          <div className="space-y-stack-md">
            <span className="text-2xl font-bold text-primary">Newron</span>
            <p className="text-body-md text-on-surface-variant max-w-xs">
              AI가 큐레이션하는 최신 뉴스와 심층 분석을 제공합니다.
            </p>
          </div>
          <div>
            <h5 className="text-headline-md text-primary mb-4">빠른 링크</h5>
            <ul className="space-y-2">
              {["회사 소개", "편집 가이드라인", "개인정보 처리방침", "이용약관"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-label-sm text-on-surface-variant hover:underline">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="text-headline-md text-primary mb-4">문의 및 연결</h5>
            <div className="flex gap-4">
              {["alternate_email", "rss_feed", "share"].map((icon) => (
                <button
                  key={icon}
                  className="p-2 bg-surface-container-low rounded-full text-primary hover:bg-primary hover:text-white transition-all"
                >
                  <span className="material-symbols-outlined">{icon}</span>
                </button>
              ))}
            </div>
            <p className="text-label-sm text-on-surface-variant mt-stack-lg opacity-80">
              © 2026 Newron. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* ── AI FAB ── */}
      <button className="fixed bottom-20 right-6 md:bottom-10 md:right-10 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-transform z-40">
        <span
          className="material-symbols-outlined text-3xl"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          auto_awesome
        </span>
      </button>

      {/* ── 모바일 하단 탭 (md 이상에서 숨김) ── */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface-container-lowest border-t border-outline-variant z-50 md:hidden">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {BOTTOM_NAV.map(({ href, label, icon }) => {
            const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 transition-colors ${
                  isActive ? "text-primary" : "text-on-surface-variant"
                }`}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {icon}
                </span>
                <span className="text-label-sm">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
