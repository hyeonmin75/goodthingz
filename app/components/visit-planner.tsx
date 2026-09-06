import { useState } from "react";

const CHECKLIST = [
	"동반 가능한 동물·체중·마릿수를 장소에 확인했다",
	"실내·야외 중 함께 이용할 수 있는 구역을 확인했다",
	"이동장·목줄·증빙서류 등 필요한 준비물을 확인했다",
	"방문일 운영시간과 휴무·마지막 입장 시간을 확인했다",
	"추가 요금과 예약 필요 여부를 확인했다",
	"주차장과 실제 입구, 이동 경로를 확인했다",
];

const QUESTIONS = {
	food: { label: "카페·음식점", text: "실내 좌석도 동반 가능한가요, 야외 좌석만 가능한가요? 주문·식사 중 이동장 사용 조건이나 좌석 제한이 있나요?", searchType: "39" },
	stay: { label: "숙박", text: "예약하려는 객실이 반려동물 동반 객실인가요? 마릿수·체중 제한, 추가 요금과 객실 밖 공용공간 이용 조건은 어떻게 되나요?", searchType: "32" },
	outdoor: { label: "관광지·산책", text: "반려동물이 이용할 수 있는 구역과 제한된 구간은 어디인가요? 마지막 입장 시간과 현장 통제 여부를 확인할 수 있을까요?", searchType: "12" },
};

export function VisitPlanner() {
	const [purpose, setPurpose] = useState<keyof typeof QUESTIONS>("food");
	const [checked, setChecked] = useState<string[]>([]);
	const [copyMessage, setCopyMessage] = useState("");
	const question = `안녕하세요. 반려동물과 방문하기 전에 문의드립니다.\n동물 종류·체중·마릿수에 따른 입장 조건과 필수 준비물이 있나요?\n${QUESTIONS[purpose].text}\n방문일 운영시간, 예약 필요 여부와 총 이용요금도 알려주세요.`;

	async function copyQuestion() {
		try {
			await navigator.clipboard.writeText(question);
			setCopyMessage("문의 문장을 복사했습니다. 전달 전에 방문일과 동물 정보를 직접 덧붙이세요.");
		} catch {
			setCopyMessage("자동 복사를 사용할 수 없습니다. 아래 문의 문장을 선택해 복사하세요.");
		}
	}

	return (
		<section id="visit-planner" className="content-section visit-planner" aria-labelledby="planner-title">
			<div>
				<p className="eyebrow">나의 출발 준비</p>
				<h2 id="planner-title">방문 준비를 한 번에 정리하세요.</h2>
				<p>체크는 직접 확인한 사실을 정리하는 메모입니다. 모두 체크해도 입장 가능을 보증하지 않으며, 내용은 이 화면을 벗어나면 사라집니다.</p>
			</div>
			<div className="planner-columns">
				<fieldset className="visit-checks">
					<legend>방문 전 확인 항목</legend>
					{CHECKLIST.map((label) => (
						<label key={label}>
							<input type="checkbox" checked={checked.includes(label)} onChange={(event) => {
								setChecked(event.target.checked ? [...checked, label] : checked.filter((item) => item !== label));
							}} />
							<span>{label}</span>
						</label>
					))}
					<p role="status">직접 확인한 항목 {checked.length} / {CHECKLIST.length}</p>
					<button type="button" className="text-button" onClick={() => setChecked([])}>체크 초기화</button>
				</fieldset>
				<div className="enquiry-tool">
					<label htmlFor="visit-purpose">어떤 장소에 문의하나요?</label>
					<select id="visit-purpose" value={purpose} onChange={(event) => { setPurpose(event.target.value as keyof typeof QUESTIONS); setCopyMessage(""); }}>
						{Object.entries(QUESTIONS).map(([key, value]) => <option value={key} key={key}>{value.label}</option>)}
					</select>
					<label htmlFor="visit-enquiry">장소에 확인할 문의 문장</label>
					<textarea id="visit-enquiry" readOnly rows={8} value={question} />
					<button className="button button-primary" type="button" onClick={copyQuestion}>문의 문장 복사</button>
					<p role="status">{copyMessage}</p>
					<a className="text-button" href={`/pet-travel?contentTypeId=${QUESTIONS[purpose].searchType}`}>이 유형의 장소 찾기</a>
				</div>
			</div>
		</section>
	);
}
