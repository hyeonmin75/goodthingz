import { useState } from "react";
import { Calculator } from "lucide-react";
import { calculatePetFee, type FeeUnit } from "../decision-tools";

export function PetFeeCalculator() {
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState<FeeUnit>("pet-night");
  const [pets, setPets] = useState("1");
  const [nights, setNights] = useState("1");
  const result = calculatePetFee(amount, pets, nights, unit);
  return <section className="fee-calculator" aria-labelledby="fee-title">
    <h3 id="fee-title"><Calculator size={20} aria-hidden="true" /> 동반 추가비를 같은 단위로</h3>
    <div className="fee-fields">
      <label>확인한 단가 (원)<input type="number" min="0" max="99999999" step="1" value={amount} onChange={e => setAmount(e.target.value)} placeholder="모르면 빈칸" /></label>
      <label>요금 기준<select value={unit} onChange={e => setUnit(e.target.value as FeeUnit)}><option value="pet-night">한 마리 · 1박당</option><option value="pet">한 마리당</option><option value="night">1박당</option><option value="visit">방문 전체</option></select></label>
      <label>반려동물 수<input type="number" min="1" max="20" value={pets} disabled={unit === "night" || unit === "visit"} onChange={e => setPets(e.target.value)} /></label>
      <label>숙박일 수 (박)<input type="number" min="1" max="30" value={nights} disabled={unit === "pet" || unit === "visit"} onChange={e => setNights(e.target.value)} /></label>
    </div>
    <div className="fee-result" role="status"><span>이번 방문의 동반 추가비</span><strong>{result ? `${result.total.toLocaleString("ko-KR")}원` : "아직 계산할 수 없음"}</strong><span>{result ? `${Number(amount).toLocaleString("ko-KR")}원 × ${result.multiplier} = ${result.total.toLocaleString("ko-KR")}원` : amount === "" ? "단가가 없으면 무료가 아닌 미확인입니다." : "금액은 0 이상의 정수, 마릿수는 1~20, 숙박일은 1~30으로 확인해 주세요."}</span></div>
    <p className="muted-copy">직접 확인한 요금 한 항목만 계산합니다. 기본 숙박료·식비·청소비·보증금은 포함하지 않으며, 무료로 확인한 항목만 0원을 입력하세요. 총액은 내 방문 계획에 따로 기록할 수 있습니다.</p>
  </section>;
}
