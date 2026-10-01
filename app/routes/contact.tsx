import { useState } from "react";
import { Link } from "react-router";
import { Copy, Mail } from "lucide-react";
import type { Route } from "./+types/contact";
import { SiteNav } from "../components/site-nav";
import { CONTACT_EMAIL, OPERATOR_NAME, CONTACT_TOPICS, contactMailText } from "../site-info";
import type { ContactTopic } from "../site-info";
import { TRAVEL_GUIDES, guidePath } from "../content/travel-guides";
import { breadcrumbJsonLd, canonicalUrl, socialMeta, webPageJsonLd } from "../seo";

export function loader({ request }: Route.LoaderArgs) {
  const params = new URL(request.url).searchParams;
  const rawTopic = params.get("topic");
  const topic: ContactTopic = rawTopic && Object.hasOwn(CONTACT_TOPICS, rawTopic) ? rawTopic as ContactTopic : "content";
  const guide = TRAVEL_GUIDES.find(item => item.id === params.get("guide"));
  return { topic, page: guide ? canonicalUrl(guidePath(guide.id)) : "" };
}

export function meta({ location }: Route.MetaArgs) {
  const title = "문의·정보 수정 요청 | GoodThingz";
  const description = "굳띵즈 운영자에게 장소 정보 오류, 기능 문제, 개인정보 관련 요청을 보내는 방법과 필요한 내용을 확인하세요.";
  return [{ title }, { name: "description", content: description }, ...socialMeta({ title, description, path: "/contact" }), { name: "robots", content: location.search ? "noindex,follow" : "index,follow" }, { tagName: "link", rel: "canonical", href: canonicalUrl("/contact") }, { "script:ld+json": [{ ...webPageJsonLd({ name: title, description, path: "/contact", dateModified: "2026-10-01" }), "@type": "ContactPage" }, breadcrumbJsonLd([{ name: "홈", path: "/" }, { name: "문의", path: "/contact" }])] }];
}

export default function Contact({ loaderData }: Route.ComponentProps) {
  const [topic, setTopic] = useState<ContactTopic>(loaderData.topic);
  const [page, setPage] = useState(loaderData.page);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const draft = contactMailText(topic, page, message);
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`[GoodThingz] ${CONTACT_TOPICS[topic]}`)}&body=${encodeURIComponent(draft)}`;
  async function copy() {
    try { await navigator.clipboard.writeText(`받는 주소: ${CONTACT_EMAIL}\n\n${draft}`); setStatus("받는 주소와 초안을 복사했습니다. 이메일에서 확인한 뒤 직접 보내주세요."); }
    catch { setStatus("자동 복사를 사용할 수 없습니다. 아래 초안을 선택해 복사하세요."); }
  }
  return <main className="content-page support-page"><SiteNav /><nav className="breadcrumb" aria-label="현재 위치"><Link reloadDocument to="/">홈</Link><span aria-hidden="true">/</span><span>문의</span></nav><header className="content-hero"><p className="eyebrow">CONTACT</p><h1>문의와 정보 수정 요청</h1><p className="lead">어떤 정보가 달랐는지, 어느 단계에서 막혔는지 알려주세요.</p><p>운영자: {OPERATOR_NAME} · <a className="contact-email" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p></header>
    <div className="support-layout"><div>
      <section className="content-section"><h2>문의 유형별로 필요한 내용</h2><dl className="support-topics"><div><dt>장소·콘텐츠 정보 수정</dt><dd>관련 페이지, 장소명·자료 번호, 잘못된 항목과 공개된 근거 링크를 알려주세요. 현재 위치나 다른 사람의 개인정보는 필요하지 않습니다.</dd></div><div><dt>검색·지도·저장 기능 문제</dt><dd>사용 기기와 브라우저, 발생한 동작 순서, 화면에 나온 오류 문구를 적어주세요. 화면을 첨부할 때 개인정보와 비밀키는 가려주세요.</dd></div><div><dt>개인정보 관련 요청</dt><dd>이 이메일로 비공개 문의해 주세요. 어떤 문의 기록이나 공개 내용에 대한 요청인지 설명하되 신분증·의료 서류를 먼저 보내지 마세요. 필요한 확인은 최소 범위로 별도 안내합니다.</dd></div><div><dt>개선 제안</dt><dd>원하는 기능 이름보다 해결하지 못한 상황과 기대한 결과를 알려주시면 판단에 도움이 됩니다.</dd></div></dl></section>
      <section className="content-section"><h2>접수 후 처리하는 범위</h2><ol className="decision-steps"><li><h3>문제와 근거를 확인합니다.</h3><p>재현에 필요한 정보가 부족하면 이메일로 추가 질문할 수 있습니다. 상시 상담센터는 아니며 답변 시각이나 처리 기한을 보장하지 않습니다.</p></li><li><h3>사이트 표시와 원자료를 구분합니다.</h3><p>표시·분류·계산 오류는 사이트에서 수정합니다. 제공기관의 원본이나 장소 자체의 운영 규칙은 굳띵즈가 직접 변경할 수 없으므로 확인 경로를 구분해 안내합니다.</p></li><li><h3>변경 내용과 한계를 알립니다.</h3><p>편집 내용이 바뀌면 관련 글의 수정일과 필요 시 정정 설명에 반영합니다. 문의 한 건을 현장 전체 검증이나 입장 승인으로 확대하지 않습니다.</p></li></ol></section>
      <section className="content-section"><h2>직접 장소에 문의할 내용</h2><p>오늘 영업 여부, 동반 허용, 객실·좌석 예약, 요금·환불은 장소 운영자나 실제 예약처에 문의해야 합니다. GoodThingz는 예약·결제·입장 승인 서비스를 운영하지 않습니다.</p><div className="source-links"><Link to="/pet-travel/guides/contact-evidence">장소에 필요한 답을 받는 질문 만들기</Link><Link to="/privacy">문의 기록과 개인정보 처리</Link></div><p>공개 기술 제보가 편하다면 <a href="https://github.com/hyeonmin75/goodthingz/issues" target="_blank" rel="noreferrer">GitHub 제보 공간</a>도 사용할 수 있습니다. GitHub 로그인이 필요하며 내용은 공개될 수 있으니 개인정보 요청에는 사용하지 마세요.</p></section>
    </div><aside className="contact-composer" aria-labelledby="draft-title"><h2 id="draft-title">이메일 초안</h2><p>입력만으로 접수되지 않습니다. 이메일 앱에서 내용을 확인하고 직접 전송합니다.</p><label>문의 유형<select value={topic} onChange={event => { setTopic(event.target.value as ContactTopic); setStatus(""); }}>{Object.entries(CONTACT_TOPICS).map(([key, name]) => <option value={key} key={key}>{name}</option>)}</select></label><label>관련 페이지<input type="url" maxLength={300} value={page} onChange={event => setPage(event.target.value)} placeholder="https://goodthingfor.com/..." /></label><label>문의 내용<textarea rows={7} maxLength={1800} value={message} onChange={event => { setMessage(event.target.value); setStatus(""); }} placeholder="어떤 상황에서 무엇이 달랐나요? 개인정보·인증키는 입력하지 마세요." /></label><div className="guide-actions"><a className="button button-primary" href={mailto}><Mail size={18} aria-hidden="true" /> 이메일 앱 열기</a><button type="button" className="button button-secondary" onClick={() => void copy()}><Copy size={18} aria-hidden="true" /> 초안 복사</button></div><p role="status">{status}</p><details><summary>전달할 초안 확인</summary><pre>{draft}</pre></details><p className="muted-copy">이 페이지의 입력은 저장하거나 서버로 보내지 않습니다. 이메일을 보내면 발신 주소와 메일 내용이 운영자의 Gmail에 전달됩니다. 메일 앱이 없으면 주소와 초안을 복사해 사용하세요.</p></aside></div>
  </main>;
}
