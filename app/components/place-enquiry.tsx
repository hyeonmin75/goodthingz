import { useState } from "react";
import { Copy, ClipboardCheck } from "lucide-react";
import type { KtoPetTourPlaceDetail } from "../../workers/api/kto-pet-tour/types";
import { placeQuestions } from "../decision-tools";

export function PlaceEnquiry({ detail, title }: { detail: KtoPetTourPlaceDetail; title: string }) {
  const rows = placeQuestions(detail);
  const [selected, setSelected] = useState<string[]>(rows.map(row => row.key));
  const [animal, setAnimal] = useState("반려견");
  const [weight, setWeight] = useState("");
  const [count, setCount] = useState("1");
  const [space, setSpace] = useState("이용 구역 미정");
  const [message, setMessage] = useState("");
  const questions = rows.filter(row => selected.includes(row.key));
  const profile = `${animal} ${/^(?:[1-9]|1\d|20)$/.test(count) ? count + "마리" : "마릿수 미정"}, ${weight && Number(weight) > 0 && Number(weight) <= 150 ? weight + "kg" : "체중 미정"}, ${space}`;
  const text = [`${title} 방문 문의`, `동반 조건: ${profile}`, ...questions.map((row, i) => `${i + 1}. ${row.question}`)].join("\n");
  async function copy() {
    try { await navigator.clipboard.writeText(text); setMessage("선택한 질문을 복사했습니다."); }
    catch { setMessage("복사하지 못했습니다. 아래 문장을 선택해 복사할 수 있습니다."); }
  }
  return <details className="place-enquiry">
    <summary><ClipboardCheck size={20} aria-hidden="true" /> 이 장소에 물어볼 질문</summary>
    <p className="muted-copy">자료에 적힌 조건과 내 조건을 대조한 뒤, 답이 필요한 항목을 남겨두세요. 표시된 안내는 입장 확정이 아닙니다. 여러 마리의 체중이 다르면 전달 전에 각각의 체중을 덧붙이세요.</p>
    <div className="enquiry-profile">
      <label>동물<select value={animal} onChange={e => setAnimal(e.target.value)}><option>반려견</option><option>고양이</option><option>그 외 동물</option></select></label>
      <label>한 마리 체중 (kg)<input type="number" min="0.1" max="150" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} placeholder="미정" /></label>
      <label>마릿수<input type="number" min="1" max="20" step="1" value={count} onChange={e => setCount(e.target.value)} /></label>
      <label>희망 구역<select value={space} onChange={e => setSpace(e.target.value)}><option>이용 구역 미정</option><option>실내 좌석</option><option>야외 공간</option><option>객실·공용공간</option></select></label>
    </div>
    <fieldset className="enquiry-checks"><legend>답변이 필요한 항목</legend>{rows.map(row => <label key={row.key}>
      <input type="checkbox" checked={selected.includes(row.key)} onChange={e => { setSelected(e.target.checked ? [...selected, row.key] : selected.filter(key => key !== row.key)); setMessage(""); }} />
      <span><strong>{row.label}</strong><span>{row.evidence || "별도 안내 없음 · 전체 원문도 확인"}</span></span>
    </label>)}</fieldset>
    <label className="enquiry-output">문의 초안<textarea readOnly rows={6} value={text} /></label>
    <button className="button button-secondary" type="button" onClick={() => void copy()} disabled={!questions.length}><Copy size={16} aria-hidden="true" /> 선택한 질문 복사</button>
    <p role="status" className="muted-copy">{message || `${questions.length}개 질문 · 입력한 동물 조건은 이 화면에서만 사용하며 자동 전송·저장하지 않습니다.`}</p>
  </details>;
}
