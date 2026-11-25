import { SITE_CONTACT_EMAIL } from "@/lib/site";

/** 문의 이메일 링크. 주소가 정해지기 전에는 안내 문구 */
export default function ContactEmail() {
  if (!SITE_CONTACT_EMAIL) return <span>(문의 이메일 준비 중)</span>;
  return (
    <a href={`mailto:${SITE_CONTACT_EMAIL}`} className="font-medium text-accent underline underline-offset-2">
      {SITE_CONTACT_EMAIL}
    </a>
  );
}
