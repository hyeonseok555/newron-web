export const metadata = {
  title: "이용약관 | Newron",
  description: "Newron 이용약관",
};

const LAST_UPDATED = "2026-08-21";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-headline-md text-on-surface font-bold">{title}</h2>
      <div className="text-body-md text-on-surface-variant space-y-2">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-stack-lg">
      <header className="space-y-2">
        <h1 className="text-headline-lg text-primary font-bold">이용약관</h1>
        <p className="text-body-md text-on-surface-variant">
          본 약관은 오현석(이하 &ldquo;운영자&rdquo;)이 제공하는 Newron 서비스(이하 &ldquo;서비스&rdquo;)의
          이용과 관련하여 운영자와 이용자의 권리, 의무 및 책임사항을 정합니다.
        </p>
      </header>

      <Section title="제1조 (목적)">
        <p>
          이 약관은 서비스의 이용조건 및 절차, 운영자와 이용자의 권리·의무 및 책임사항을
          규정함을 목적으로 합니다.
        </p>
      </Section>

      <Section title="제2조 (정의)">
        <ul className="list-disc list-inside space-y-1">
          <li>&ldquo;서비스&rdquo;란 Newron이 제공하는 AI 뉴스 큐레이션, 개인화 추천, 브리핑 등 일체의 기능을 말합니다.</li>
          <li>&ldquo;이용자&rdquo;란 서비스에 접속하여 이 약관에 따라 서비스를 이용하는 회원 및 비회원(게스트)을 말합니다.</li>
          <li>&ldquo;회원&rdquo;이란 Google 계정으로 로그인하여 서비스를 이용하는 자를 말합니다.</li>
        </ul>
      </Section>

      <Section title="제3조 (약관의 효력 및 변경)">
        <p>
          이 약관은 서비스 화면에 게시하거나 기타의 방법으로 공지함으로써 효력이 발생합니다.
          운영자는 관계 법령을 위반하지 않는 범위에서 약관을 개정할 수 있으며, 개정 시 적용일자
          및 개정사유를 명시하여 사전 공지합니다.
        </p>
      </Section>

      <Section title="제4조 (서비스의 제공 및 변경)">
        <p>
          서비스는 외부 뉴스 제공사의 기사를 수집·가공하여 제공하며, 일부 콘텐츠는 AI를 통해
          요약 또는 가공될 수 있습니다. 운영자는 서비스의 내용, 운영상 또는 기술상 필요에 따라
          제공하는 서비스의 전부 또는 일부를 변경할 수 있습니다.
        </p>
      </Section>

      <Section title="제5조 (회원가입 및 탈퇴)">
        <p>
          이용자는 Google 로그인을 통해 회원가입 절차를 거쳐 서비스를 이용할 수 있으며, 별도
          가입 없이 게스트로도 이용할 수 있습니다. 회원은 언제든지 앱 내 탈퇴 기능을 통해 이용
          계약을 해지할 수 있습니다.
        </p>
      </Section>

      <Section title="제6조 (이용자의 의무)">
        <ul className="list-disc list-inside space-y-1">
          <li>타인의 계정을 부정하게 사용하는 행위</li>
          <li>서비스를 이용하여 얻은 정보를 운영자의 사전 승낙 없이 복제, 유통, 상업적으로 이용하는 행위</li>
          <li>서비스의 안정적 운영을 방해하는 행위</li>
        </ul>
      </Section>

      <Section title="제7조 (콘텐츠 및 저작권)">
        <p>
          서비스에서 제공하는 뉴스 기사의 저작권은 원 저작권자(언론사 등)에게 있습니다. AI가
          생성한 요약·가공 콘텐츠는 참고용이며, 정확한 내용은 원문 보기를 통해 확인할 수
          있습니다. 이용자는 서비스를 통해 얻은 정보를 운영자 또는 원저작권자의 사전 승인 없이
          영리 목적으로 이용할 수 없습니다.
        </p>
      </Section>

      <Section title="제8조 (면책조항)">
        <p>
          운영자는 천재지변, 외부 API 제공자의 장애 등 통제할 수 없는 사유로 서비스를 제공할 수
          없는 경우 책임이 면제됩니다. 또한 AI가 생성한 요약·추천 콘텐츠의 정확성에 대해
          보증하지 않으며, 이용자는 원문을 통해 내용을 확인할 책임이 있습니다.
        </p>
      </Section>

      <Section title="제9조 (분쟁해결 및 준거법)">
        <p>
          이 약관은 대한민국 법령에 따라 규율되고 해석되며, 서비스 이용과 관련하여 분쟁이 발생할
          경우 관련 법령이 정한 관할 법원에 제소할 수 있습니다.
        </p>
      </Section>

      <Section title="제10조 (문의처)">
        <p>
          이용약관 관련 문의는{" "}
          <a href="mailto:juing95@gmail.com" className="text-primary underline">
            juing95@gmail.com
          </a>
          으로 연락 주시기 바랍니다.
        </p>
      </Section>

      <p className="text-label-sm text-on-surface-variant">시행일 / 최종 수정일: {LAST_UPDATED}</p>
    </div>
  );
}
