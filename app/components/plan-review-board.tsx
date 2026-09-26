import { useRef, useState } from "react";
import { ArrowRight, Check, CircleHelp, Download, ListChecks, Table2, TriangleAlert } from "lucide-react";
import { Link } from "react-router";
import { CHECK_FIELDS, CHECK_LABELS, planComparisonCsv, planReviewSummary, planReviewTasks } from "../plan";
import type { VisitPlan } from "../plan";

export function PlanReviewBoard({ plan, onReview }: { plan: VisitPlan; onReview: (stop: number, field: number) => void }) {
  const [view, setView] = useState<"tasks" | "comparison">("tasks");
  const [filter, setFilter] = useState("all");
  const [message, setMessage] = useState("");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const summary = planReviewSummary(plan);
  const tasks = planReviewTasks(plan).filter(task => filter === "all" || task.status === filter);
  function download() {
    const url = URL.createObjectURL(new Blob([planComparisonCsv(plan)], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "goodthingz-place-comparison.csv";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage("비교표를 내려받았습니다. 개인 메모·예산·방문 날짜는 제외했습니다.");
  }
  return <section className="review-board" id="plan-review" aria-labelledby="review-title">
    <header className="review-heading"><div><p className="eyebrow">VISIT WORKSPACE</p><h2 id="review-title">출발 전에 남은 확인</h2></div>
      <button type="button" className="text-button" onClick={download} disabled={!plan.stops.length}><Download size={18} aria-hidden="true" /> 비교표 내려받기 (CSV)</button>
    </header>
    <dl className="review-metrics" aria-label="내가 기록한 확인 현황">
      <div><dt><Check size={17} aria-hidden="true" /> 내가 확인함</dt><dd>{summary.confirmed}<small>개 항목</small></dd></div>
      <div><dt><CircleHelp size={17} aria-hidden="true" /> 미확인</dt><dd>{summary.unknown}<small>개 항목</small></dd></div>
      <div><dt><TriangleAlert size={17} aria-hidden="true" /> 조건 불일치</dt><dd>{summary.blocked}<small>개 항목</small></dd></div>
    </dl>
    <div className="review-progress"><label htmlFor="review-progress">직접 확인한 항목 {summary.confirmed} / {summary.total}</label><progress id="review-progress" value={summary.confirmed} max={summary.total || 1} /><p>{plan.stops.length ? `4항목 모두 확인한 후보 ${summary.completedStops} / ${plan.stops.length}곳` : "후보를 추가하면 확인할 항목이 나타납니다."} · 입장 보증이나 추천 점수가 아닙니다.</p></div>
    <div className="review-tabs" role="tablist" aria-label="방문 준비 보기">
      {(["tasks", "comparison"] as const).map((key, index) => <button type="button" role="tab" key={key} id={`review-tab-${key}`} aria-controls={`review-panel-${key}`} aria-selected={view === key} tabIndex={view === key ? 0 : -1} ref={node => { tabRefs.current[index] = node; }} onClick={() => setView(key)} onKeyDown={event => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const target = event.key === "Home" ? 0 : event.key === "End" ? 1 : 1 - index;
        setView(target === 0 ? "tasks" : "comparison"); tabRefs.current[target]?.focus();
      }}>{key === "tasks" ? <ListChecks size={18} aria-hidden="true" /> : <Table2 size={18} aria-hidden="true" />}{key === "tasks" ? "확인할 일" : "후보 비교표"}</button>)}
    </div>
    <div id="review-panel-tasks" role="tabpanel" aria-labelledby="review-tab-tasks" hidden={view !== "tasks"}>
      <div className="review-task-heading"><label>확인 항목<select aria-label="확인 항목" value={filter} onChange={e => setFilter(e.target.value)}><option value="all">남은 항목 전체</option><option value="blocked">조건 불일치만</option><option value="unknown">미확인만</option></select></label><span role="status">{tasks.length}개 남음</span></div>
      {tasks.length ? <ol className="review-tasks" tabIndex={0} aria-label="남은 확인 항목 목록">{tasks.map(task => <li key={`${task.stopIndex}-${task.fieldIndex}`}>
        <span className={`review-state ${task.status}`}>{CHECK_LABELS[task.status]}</span><div><strong>{task.title}</strong><span>{task.field}</span></div>
        <button type="button" onClick={() => onReview(task.stopIndex, task.fieldIndex)} aria-label={`${task.title} ${task.field} 확인 상태 수정`} title="해당 확인 항목으로 이동"><ArrowRight size={20} aria-hidden="true" /></button>
      </li>)}</ol> : <p className="review-empty">{!plan.stops.length ? "저장한 장소를 아래에서 계획에 추가하세요." : filter === "all" ? "남은 확인 항목이 없습니다. 방문일이나 동물 조건이 달라지면 다시 확인하세요." : "이 조건에 해당하는 확인 항목이 없습니다."}</p>}
      {!plan.stops.length ? <a className="text-button" href="#plan-candidates">첫 후보 추가 <ArrowRight size={16} aria-hidden="true" /></a> : <Link className="text-button" to="/pet-travel/guides#uncertain">답이 모호할 때 물어볼 질문 <ArrowRight size={16} aria-hidden="true" /></Link>}
    </div>
    <div id="review-panel-comparison" role="tabpanel" aria-labelledby="review-tab-comparison" hidden={view !== "comparison"}>
      {plan.stops.length ? <div className="review-table-wrap" role="region" aria-label="장소별 확인 비교표" tabIndex={0}>
        <table className="review-table"><caption>후보별 4가지 조건 · 사용자가 직접 기록한 상태</caption><thead><tr><th scope="col">확인 기준</th>{plan.stops.map(stop => <th scope="col" key={stop.id}>{stop.title}</th>)}</tr></thead><tbody>{CHECK_FIELDS.map((field, fieldIndex) => <tr key={field}><th scope="row">{field}</th>{plan.stops.map((stop, stopIndex) => <td key={stop.id}><button type="button" className={`review-state ${stop.checks[fieldIndex]}`} onClick={() => onReview(stopIndex, fieldIndex)} aria-label={`${stop.title} ${field}: ${CHECK_LABELS[stop.checks[fieldIndex]]}, 수정`}>{CHECK_LABELS[stop.checks[fieldIndex]]}</button></td>)}</tr>)}</tbody></table>
      </div> : <p className="review-empty">비교할 후보가 아직 없습니다.</p>}
      <p className="muted-copy">체크는 공식 자료의 자동 판정이 아닙니다. 원자료와 실제 답변을 대조해 기록하세요.</p>
    </div>
    <p role="status" className="review-download-status">{message}</p>
  </section>;
}
