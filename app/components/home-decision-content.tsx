import { Link } from "react-router";

const SCENARIOS = [
	{ id: "food", number: "01", title: "밥 먹을 곳을 찾는다면", type: "39", command: "카페·음식점 찾기", first: "실내 동반 구역부터", body: "‘동반 가능’이라고 적혀 있어도 야외 좌석만 허용될 수 있습니다. 식사할 구역, 이동장 사용 조건, 주문 중 동물과 함께 머물 수 있는지를 확인하세요.", question: "실내 좌석도 함께 이용할 수 있나요?" },
	{ id: "stay", number: "02", title: "하룻밤 묵을 곳을 찾는다면", type: "32", command: "숙박 후보 찾기", first: "예약할 객실의 조건부터", body: "숙소 전체 소개만으로 예약할 객실의 동반 여부를 판단하지 마세요. 동반 객실 지정, 마릿수·체중 제한, 추가 요금과 공용공간 이용 조건을 따로 확인하세요.", question: "이 객실의 동반 조건과 총 추가 요금은 얼마인가요?" },
	{ id: "outdoor", number: "03", title: "산책·나들이를 계획한다면", type: "12", command: "관광지 후보 찾기", first: "이용 구역과 입구부터", body: "지도에 가까워 보여도 실제 입구가 멀거나 특정 구간은 출입이 제한될 수 있습니다. 주차장부터 입구까지 경로와 이용 가능한 구간, 방문일 통제 여부를 확인하세요.", question: "함께 걸을 수 있는 구간과 실제 입구는 어디인가요?" },
];

export function HomeDecisionContent() {
	return <>
		<section className="editorial-section" aria-labelledby="scenario-title">
			<header className="editorial-heading"><p className="eyebrow">방문 목적별 판단 가이드</p><h2 id="scenario-title">같은 ‘동반 가능’도, 확인할 조건은 다릅니다.</h2><p>장소 유형에 따라 달라지는 확인 순서입니다. 개별 장소의 허용 조건을 대신하는 안내는 아닙니다.</p></header>
			<div className="scenario-grid">{SCENARIOS.map((item) => <article className="scenario-card" key={item.id}>
				<div className="scenario-number" aria-hidden="true">{item.number}</div><h3>{item.title}</h3><strong>{item.first}</strong><p>{item.body}</p><blockquote>{item.question}</blockquote><a href={`/pet-travel?contentTypeId=${item.type}`}>{item.command}</a>
			</article>)}</div>
		</section>
		<section className="editorial-section decision-example" aria-labelledby="example-title">
			<header className="editorial-heading"><p className="eyebrow">비교할 때 놓치기 쉬운 것</p><h2 id="example-title">더 가까운 곳이 항상 더 맞는 곳은 아닙니다.</h2><p>아래는 판단 방법을 설명하기 위한 가상 예시입니다. 실제 장소·거리·동반 정책이 아닙니다.</p></header>
			<div className="example-table-wrap"><table className="example-table"><caption>가상 후보 A와 B의 조건 비교</caption><thead><tr><th scope="col">판단 기준</th><th scope="col">후보 A · 가상</th><th scope="col">후보 B · 가상</th></tr></thead><tbody>
				<tr><th scope="row">표시 거리</th><td>1km</td><td>3km</td></tr>
				<tr><th scope="row">이용 구역 안내</th><td>야외만 가능</td><td>실내 지정 구역 가능</td></tr>
				<tr><th scope="row">동물·체중 조건</th><td>정보 없음</td><td>체중 제한 안내 있음</td></tr>
				<tr><th scope="row">먼저 할 일</th><td>방문일 야외 이용과 동물 조건 문의</td><td>내 동물이 제한에 해당하는지 확인</td></tr>
			</tbody></table></div>
			<p className="example-conclusion">실내 이용이 필요한 날이라면 거리보다 이용 구역을 먼저 보세요. ‘정보 없음’은 입장 허용도 금지도 뜻하지 않습니다. 중요한 조건을 확인할 수 없다면 일정을 확정하기 전에 다른 후보도 함께 검토하세요.</p>
			<Link className="button button-primary" to="/pet-travel/guides/visit-checklist#visit-planner">출발 체크리스트와 문의 문장 만들기</Link>
		</section>
		<section className="editorial-section" aria-labelledby="answers-title">
			<header className="editorial-heading"><p className="eyebrow">검색 전에 알아두면 좋은 답</p><h2 id="answers-title">결과를 정확하게 읽는 네 가지 기준</h2></header>
			<div className="answer-list">
				<details><summary>목록에 나오면 우리 반려동물도 입장할 수 있나요?</summary><p>목록은 한국관광공사 반려동물 동반여행 데이터에 등록된 후보입니다. 동물 종류·체중·마릿수·준비물·이용 구역은 장소마다 다를 수 있습니다. 상세 안내가 있다는 표시도 내 동물의 입장을 보증하지 않습니다.</p></details>
				<details><summary>표시된 거리로 도착 시간을 알 수 있나요?</summary><p>거리는 위치 기반 API가 제공하는 값이며 실제 도로 경로나 소요시간이 아닙니다. 입구 위치, 교통수단과 도로 상황에 따라 이동 시간이 달라지므로 출발 전에 지도에서 경로를 확인하세요.</p></details>
				<details><summary>오늘 영업·현재 요금·예약 가능 여부도 확인되나요?</summary><p>원본에 운영시간·요금·예약 안내가 있으면 보여주지만 현재 영업이나 예약 잔여를 실시간으로 확인하지는 않습니다. 표시된 안내와 실제 방문일 조건이 같은지는 장소에 확인해야 합니다.</p></details>
				<details><summary>주변 검색 결과가 없으면 동반 장소가 없는 건가요?</summary><p>이 서비스가 사용하는 데이터와 현재 검색 조건에서 후보를 찾지 못했다는 뜻입니다. 반경이나 장소 유형을 바꾸고, 꼭 필요한 조건은 장소에 직접 문의하세요. 전국의 모든 동반 장소를 포함한다고 보장하지 않습니다.</p></details>
			</div>
		</section>
		<section id="source" className="editorial-section source-summary"><h2>출처와 해석 기준</h2><p>장소 정보: 한국관광공사 반려동물 동반여행 서비스. 제공기관 갱신 기준은 일 1회이며, 각 장소가 매일 현장 검증됐다는 뜻은 아닙니다. 이 페이지의 상황별 가이드와 비교 예시는 GoodThingz가 작성한 방문 판단 안내입니다.</p><p>콘텐츠 수정일: 2026년 9월 6일 · 실제 방문 후기나 인기 순위로 작성한 추천 목록이 아닙니다.</p><div className="source-links"><Link to="/data-sources/kto-pet-tour">데이터 출처·이용조건</Link><Link to="/pet-travel/guides/visit-checklist">출발 전 확인 가이드</Link><Link to="/about">작성·수정 원칙과 제보</Link></div></section>
	</>;
}
