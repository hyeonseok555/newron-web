export const metadata = {
  title: "개인정보처리방침 | Newron",
  description: "Newron 개인정보처리방침",
};

const LAST_UPDATED = "2026-08-18";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-headline-md text-on-surface font-bold">{title}</h2>
      <div className="text-body-md text-on-surface-variant space-y-2">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-stack-lg">
      <header className="space-y-2">
        <h1 className="text-headline-lg text-primary font-bold">개인정보처리방침</h1>
        <p className="text-body-md text-on-surface-variant">
          Newron(이하 &ldquo;서비스&rdquo;)을 운영하는 오현석(이하 &ldquo;운영자&rdquo;)은 이용자의 개인정보를
          중요하게 생각하며, 관련 법령을 준수하여 아래와 같이 개인정보를 처리합니다.
        </p>
      </header>

      <Section title="1. 수집하는 개인정보 항목">
        <ul className="list-disc list-inside space-y-1">
          <li>Google 로그인 이용 시: 이메일 주소, 이름</li>
          <li>비로그인(게스트) 이용 시: 기기에 저장되는 임의 식별자(UUID) — 개인을 식별할 수 없는 정보</li>
          <li>서비스 이용 과정에서 생성되는 정보: 북마크, 열람 기록, 검색 키워드, AI 질의응답 내용</li>
        </ul>
      </Section>

      <Section title="2. 개인정보의 수집 및 이용 목적">
        <ul className="list-disc list-inside space-y-1">
          <li>회원 식별 및 로그인 상태 유지</li>
          <li>맞춤 뉴스 추천 등 개인화 서비스 제공</li>
          <li>서비스 품질 개선 및 이용 통계 분석</li>
        </ul>
      </Section>

      <Section title="3. 개인정보의 보유 및 이용 기간">
        <p>
          이용자가 회원 탈퇴를 요청하는 즉시 관련 개인정보를 파기합니다. 다만 관계 법령에 따라
          보관이 필요한 정보는 해당 법령에서 정한 기간 동안 보관합니다.
        </p>
      </Section>

      <Section title="4. 개인정보의 제3자 제공">
        <p>
          운영자는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만 법령에 근거가
          있거나 이용자의 별도 동의가 있는 경우에는 예외로 합니다.
        </p>
      </Section>

      <Section title="5. 개인정보 처리 위탁">
        <p>Google LLC — OAuth 소셜 로그인 인증 처리</p>
      </Section>

      <Section title="6. 이용자의 권리">
        <p>
          이용자는 언제든지 자신의 개인정보에 대한 열람, 정정, 삭제, 처리정지를 요청할 수
          있습니다. 아래 문의처로 연락 주시면 지체 없이 조치합니다.
        </p>
      </Section>

      <Section title="7. 개인정보 보호책임자">
        <ul className="list-disc list-inside space-y-1">
          <li>성명: 오현석</li>
          <li>이메일: juing95@gmail.com</li>
        </ul>
      </Section>

      <Section title="8. 고지 의무">
        <p>
          본 방침은 법령 및 서비스 변경사항을 반영하기 위해 개정될 수 있으며, 개정 시 서비스 내
          공지사항 또는 본 페이지를 통해 안내합니다.
        </p>
      </Section>

      <p className="text-label-sm text-on-surface-variant">최종 수정일: {LAST_UPDATED}</p>
    </div>
  );
}
