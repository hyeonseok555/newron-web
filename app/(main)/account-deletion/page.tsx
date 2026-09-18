import Link from "next/link";

export const metadata = {
  title: "계정 및 데이터 삭제 안내 | Newron",
  description: "Newron 계정 및 데이터 삭제 방법 안내",
};

const LAST_UPDATED = "2026-08-18";

export default function AccountDeletionPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-stack-lg">
      <header className="space-y-2">
        <h1 className="text-headline-lg text-primary font-bold">계정 및 데이터 삭제 안내</h1>
        <p className="text-body-md text-on-surface-variant">
          Newron 앱에서 회원 탈퇴를 진행하면 계정과 관련된 개인정보 및 이용 데이터가 삭제됩니다.
        </p>
      </header>

      <section className="bg-surface-container-low rounded-card p-stack-lg space-y-stack-md">
        <h2 className="text-headline-md text-on-surface font-bold">앱에서 직접 탈퇴하는 방법</h2>
        <ol className="list-decimal list-inside space-y-1 text-body-md text-on-surface-variant">
          <li>Newron 앱 실행 후 로그인</li>
          <li>하단 탭에서 &lsquo;프로필&rsquo; 이동</li>
          <li>화면 하단 계정 메뉴에서 &lsquo;회원 탈퇴&rsquo; 선택</li>
          <li>안내에 따라 탈퇴 절차 진행</li>
        </ol>
      </section>

      <section className="bg-surface-container-low rounded-card p-stack-lg space-y-stack-md">
        <h2 className="text-headline-md text-on-surface font-bold">삭제되는 정보</h2>
        <ul className="list-disc list-inside space-y-1 text-body-md text-on-surface-variant">
          <li>계정 정보 (이메일, 이름)</li>
          <li>북마크 및 열람 기록</li>
          <li>검색 키워드 및 개인화 추천 데이터</li>
        </ul>
        <p className="text-body-md text-on-surface-variant">
          단, 관계 법령에 따라 일정 기간 보관이 필요한 정보는 해당 기간 동안 별도 보관될 수 있습니다.
        </p>
      </section>

      <section className="bg-surface-container-low rounded-card p-stack-lg space-y-stack-md">
        <h2 className="text-headline-md text-on-surface font-bold">앱을 사용할 수 없는 경우</h2>
        <p className="text-body-md text-on-surface-variant">
          앱 삭제 등으로 직접 탈퇴가 어려운 경우, 아래 이메일로 계정 삭제를 요청해 주세요. 본인
          확인 후 영업일 기준 순차적으로 처리됩니다.
        </p>
        <a
          href="mailto:juing95@gmail.com?subject=Newron 계정 삭제 요청"
          className="text-primary underline text-body-md"
        >
          juing95@gmail.com
        </a>
      </section>

      <p className="text-body-md text-on-surface-variant">
        개인정보 처리에 대한 자세한 내용은{" "}
        <Link href="/privacy" className="text-primary underline">
          개인정보처리방침
        </Link>
        을 확인해 주세요.
      </p>

      <p className="text-label-sm text-on-surface-variant">최종 수정일: {LAST_UPDATED}</p>
    </div>
  );
}
