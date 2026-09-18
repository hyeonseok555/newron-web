import Link from "next/link";

export const metadata = {
  title: "고객지원 | Newron",
  description: "Newron 앱 문의처 및 고객지원 안내",
};

const LAST_UPDATED = "2026-08-18";

export default function SupportPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-stack-lg">
      <header className="space-y-2">
        <h1 className="text-headline-lg text-primary font-bold">Newron 고객지원</h1>
        <p className="text-body-md text-on-surface-variant">
          Newron은 AI가 큐레이션하는 뉴스와 개인화 브리핑을 제공하는 서비스입니다.
          이용 중 궁금한 점이나 불편사항은 아래 연락처로 문의해 주세요.
        </p>
      </header>

      <section className="bg-surface-container-low rounded-card p-stack-lg space-y-stack-md">
        <h2 className="text-headline-md text-on-surface font-bold">문의하기</h2>
        <dl className="space-y-3">
          <div>
            <dt className="text-label-sm text-on-surface-variant">운영 주체</dt>
            <dd className="text-body-md text-on-surface">오현석</dd>
          </div>
          <div>
            <dt className="text-label-sm text-on-surface-variant">문의 이메일</dt>
            <dd className="text-body-md text-on-surface">
              <a href="mailto:juing95@gmail.com" className="text-primary underline">
                juing95@gmail.com
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-label-sm text-on-surface-variant">문의 가능 시간</dt>
            <dd className="text-body-md text-on-surface">
              평일 10:00 – 18:00 (주말 및 공휴일 휴무, 영업일 기준 순차 답변)
            </dd>
          </div>
        </dl>
      </section>

      <section className="bg-surface-container-low rounded-card p-stack-lg space-y-stack-md">
        <h2 className="text-headline-md text-on-surface font-bold">정책 안내</h2>
        <ul className="space-y-2">
          <li>
            <Link href="/privacy" className="text-primary underline text-body-md">
              개인정보처리방침
            </Link>
          </li>
          <li>
            <Link href="/account-deletion" className="text-primary underline text-body-md">
              계정 및 데이터 삭제 안내
            </Link>
          </li>
          <li>
            <Link href="/terms" className="text-primary underline text-body-md">
              이용약관
            </Link>
          </li>
        </ul>
      </section>

      <section className="bg-surface-container-low rounded-card p-stack-lg space-y-3">
        <h2 className="text-headline-md text-on-surface font-bold">앱 정보</h2>
        <dl className="space-y-3">
          <div>
            <dt className="text-label-sm text-on-surface-variant">앱 이름</dt>
            <dd className="text-body-md text-on-surface">Newron</dd>
          </div>
          <div>
            <dt className="text-label-sm text-on-surface-variant">운영 주체</dt>
            <dd className="text-body-md text-on-surface">오현석</dd>
          </div>
          <div>
            <dt className="text-label-sm text-on-surface-variant">최종 업데이트</dt>
            <dd className="text-body-md text-on-surface">{LAST_UPDATED}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
