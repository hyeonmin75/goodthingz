export const OPERATOR_NAME = "굳띵즈";
export const CONTACT_EMAIL = "goodthingz57775@gmail.com";
export const POLICY_UPDATED = "2026-10-01";

export const CONTACT_TOPICS = {
  content: "장소·콘텐츠 정보 수정",
  feature: "검색·지도·저장 기능 문제",
  privacy: "개인정보 문의·삭제 요청",
  suggestion: "개선 제안",
} as const;
export type ContactTopic = keyof typeof CONTACT_TOPICS;

export function contactMailText(topic: ContactTopic, page: string, message: string) {
  return [`문의 유형: ${CONTACT_TOPICS[topic]}`, `관련 페이지: ${page || "미입력"}`, "", message.trim(), "", "민감한 서류·인증키·정확한 현재 위치는 첨부하지 않았는지 확인해 주세요."].join("\n");
}
