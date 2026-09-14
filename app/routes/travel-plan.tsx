import { useEffect, useRef, useState } from "react";
import { ArrowUp, ArrowDown, Trash2, Download, Printer, Save } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/travel-plan";
import { SiteNav } from "../components/site-nav";
import { canonicalUrl, socialMeta } from "../seo";
import {
  CHECK_FIELDS,
  COST_LABELS,
  PLAN_KEY,
  SAVED_KEY,
  costSummary,
  emptyPlan,
  parsePlan,
  planShareText,
} from "../plan";
import type { CheckStatus, PlanStop, VisitPlan } from "../plan";

export function meta({}: Route.MetaArgs) {
  const title = "내 반려동물 방문 계획 | GoodThingz";
  const description =
    "선택한 장소의 확인 상태와 메모를 기록하고, 확인한 비용을 계산해 방문 후보 계획을 저장·공유하세요.";
  return [
    { title },
    { name: "description", content: description },
    ...socialMeta({ title, description, path: "/pet-travel/plan" }),
    { name: "robots", content: "noindex,follow" },
    {
      tagName: "link",
      rel: "canonical",
      href: canonicalUrl("/pet-travel/plan"),
    },
  ];
}

export default function TravelPlan() {
  const [plan, setPlan] = useState<VisitPlan>(emptyPlan);
  const [saved, setSaved] = useState<PlanStop[]>([]);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [includeDate, setIncludeDate] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [customName, setCustomName] = useState("");
  const importRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PLAN_KEY);
      if (raw) {
        const parsed = parsePlan(JSON.parse(raw));
        if (parsed) setPlan(parsed);
        else
          setMessage(
            "저장된 계획 형식을 읽을 수 없습니다. 새 계획을 작성할 수 있습니다.",
          );
      }
      const candidates: unknown = JSON.parse(
        localStorage.getItem(SAVED_KEY) || "[]",
      );
      if (Array.isArray(candidates))
        setSaved(
          candidates.slice(0, 12).flatMap((item) => {
            if (
              !item ||
              typeof item.id !== "string" ||
              typeof item.title !== "string"
            )
              return [];
            return [
              {
                id: item.id.slice(0, 100),
                title: item.title.slice(0, 200),
                address:
                  typeof item.address?.full === "string"
                    ? item.address.full.slice(0, 500)
                    : "",
                checks: CHECK_FIELDS.map(() => "unknown" as const),
                note: "",
              },
            ];
          }),
        );
    } catch {
      setMessage(
        "기기의 저장 자료를 읽지 못했습니다. 이 화면에서 새 계획은 작성할 수 있습니다.",
      );
    }
    setReady(true);
  }, []);
  function updateStop(id: string, update: Partial<PlanStop>) {
    setPlan((p) => ({
      ...p,
      stops: p.stops.map((s) => (s.id === id ? { ...s, ...update } : s)),
    }));
  }
  function addStop(stop: PlanStop) {
    if (plan.stops.length >= 6) {
      setMessage("한 계획에는 최대 6곳을 넣을 수 있습니다.");
      return;
    }
    if (plan.stops.some((s) => s.id === stop.id)) return;
    setPlan((p) => ({
      ...p,
      stops: [...p.stops, { ...stop, checks: [...stop.checks] }],
    }));
  }
  function moveStop(index: number, direction: number) {
    setPlan((p) => {
      const stops = [...p.stops];
      const target = index + direction;
      if (target < 0 || target >= stops.length) return p;
      [stops[index], stops[target]] = [stops[target], stops[index]];
      return { ...p, stops };
    });
  }
  function save() {
    try {
      localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
      setMessage(
        "이 기기에 계획을 저장했습니다. 다른 기기로 자동 전송되지 않습니다.",
      );
    } catch {
      setMessage(
        "기기 저장을 사용할 수 없습니다. 계획 파일 내려받기를 이용하세요.",
      );
    }
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(plan, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "goodthingz-visit-plan.json";
    a.click();
    URL.revokeObjectURL(url);
    setMessage(
      "개인 메모와 예산을 포함한 계획 파일을 내려받았습니다. 파일은 직접 관리하세요.",
    );
  }
  async function importFile(file: File | undefined) {
    if (!file) return;
    try {
      if (file.size > 50000) throw new Error("size");
      const parsed = parsePlan(JSON.parse(await file.text()));
      if (!parsed) throw new Error("format");
      if (
        plan.stops.length &&
        !window.confirm(
          "현재 화면의 계획을 불러온 파일로 바꿀까요? 저장하지 않은 변경은 사라집니다.",
        )
      )
        return;
      setPlan(parsed);
      setMessage("계획을 불러왔습니다. 기기에 보관하려면 저장하세요.");
    } catch {
      setMessage(
        "이 계획 파일을 읽을 수 없습니다. GoodThingz에서 내려받은 50KB 이하 파일인지 확인하세요.",
      );
    } finally {
      if (importRef.current) importRef.current.value = "";
    }
  }
  function clear() {
    if (
      !window.confirm(
        "현재 계획과 이 기기에 저장한 계획을 지울까요? 장소 즐겨찾기는 유지됩니다.",
      )
    )
      return;
    setPlan(emptyPlan());
    try {
      localStorage.removeItem(PLAN_KEY);
      setMessage("계획을 삭제했습니다.");
    } catch {
      setMessage(
        "화면은 비웠지만 기기 저장 삭제에 실패했습니다. 브라우저 사이트 데이터에서 삭제하세요.",
      );
    }
  }
  const shareText = planShareText({
    ...plan,
    date: includeDate ? plan.date : "",
  });
  async function share() {
    try {
      if (navigator.share)
        await navigator.share({
          title: "GoodThingz 방문 계획",
          text: shareText,
        });
      else await navigator.clipboard.writeText(shareText);
      setMessage("공유할 내용을 전달했습니다.");
    } catch {
      setMessage(
        "공유가 취소됐거나 지원되지 않습니다. 미리보기 문장을 선택해 복사할 수 있습니다.",
      );
    }
  }
  const budget = costSummary(plan.costs);
  return (
    <main className="plan-page">
      <SiteNav />
      <header className="library-intro">
        <p className="eyebrow">MY VISIT PLAN</p>
        <h1>내 방문 계획</h1>
        <p className="lead">후보를 고르고, 확인한 조건을 남기세요.</p>
        <p>
          체크는 사용자가 확인한 기록입니다. 입장 보증이나 자동 경로 추천이
          아닙니다. 저장 버튼을 눌러야 다음 방문에 이어 쓸 수 있으며, 메모에
          연락처·주소·민감한 자료를 적지 마세요.
        </p>
      </header>
      <div className="plan-layout">
        <aside className="plan-sidebar">
          <h2>후보 추가</h2>
          <p>장소 검색에서 저장한 후보</p>
          {saved.length ? (
            saved.map((s) => (
              <button
                className="saved-candidate"
                type="button"
                key={s.id}
                disabled={
                  plan.stops.some((stop) => stop.id === s.id) ||
                  plan.stops.length >= 6
                }
                onClick={() => addStop(s)}
              >
                <strong>{s.title}</strong>
                <span>
                  {plan.stops.some((stop) => stop.id === s.id)
                    ? "추가됨"
                    : s.address || "계획에 추가"}
                </span>
              </button>
            ))
          ) : (
            <p>저장한 장소가 없습니다.</p>
          )}
          <Link className="button button-primary" to="/pet-travel">
            장소 찾기
          </Link>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (customName.trim()) {
                addStop({
                  id: `manual-${crypto.randomUUID()}`,
                  title: customName.trim(),
                  address: "직접 추가 · 공식 데이터 미연결",
                  checks: CHECK_FIELDS.map(() => "unknown"),
                  note: "",
                });
                setCustomName("");
              }
            }}
          >
            <label htmlFor="custom-place">직접 후보 이름 입력</label>
            <input
              id="custom-place"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              maxLength={100}
              required
            />
            <button
              type="submit"
              className="button button-secondary"
              disabled={plan.stops.length >= 6}
            >
              후보 추가
            </button>
          </form>
          <Link to="/pet-travel/guides">상황별 확인 가이드</Link>
        </aside>
        <div className="plan-main">
          <div className="plan-toolbar">
            <label>
              방문 예정일
              <input
                type="date"
                value={plan.date}
                onChange={(e) =>
                  setPlan((p) => ({ ...p, date: e.target.value }))
                }
              />
            </label>
            <button
              className="button button-primary"
              type="button"
              disabled={!ready}
              onClick={save}
            >
              <Save size={18} aria-hidden="true" /> 이 기기에 저장
            </button>
            <button
              className="button button-secondary"
              type="button"
              disabled={!plan.stops.length}
              onClick={() => setShowShare(!showShare)}
            >
              공유 미리보기
            </button>
          </div>
          <p role="status" className="plan-status">
            {message ||
              (ready
                ? "변경 후 저장 버튼을 눌러 보관하세요."
                : "기기에 저장한 계획을 읽고 있습니다.")}
          </p>
          {showShare ? (
            <section className="share-preview">
              <h2>공유할 내용</h2>
              <label>
                <input
                  type="checkbox"
                  checked={includeDate}
                  onChange={(e) => setIncludeDate(e.target.checked)}
                />{" "}
                방문 예정일 포함
              </label>
              <p>
                장소와 확인 상태만 포함합니다. 개인 메모·예산·현재 위치는
                제외됩니다.
              </p>
              <textarea
                aria-label="공유 내용 미리보기"
                value={shareText}
                readOnly
                rows={9}
              />
              <button
                className="button button-primary"
                type="button"
                onClick={() => void share()}
              >
                이 내용 공유
              </button>
            </section>
          ) : null}
          <section aria-labelledby="stops-title">
            <h2 id="stops-title">방문 후보 {plan.stops.length} / 6</h2>
            {!plan.stops.length ? (
              <div className="plan-empty">
                <h3>첫 후보부터 정해보세요.</h3>
                <p>
                  저장한 장소를 추가하거나 이름을 직접 입력하세요. 정해지지 않은
                  조건은 미확인 상태로 남길 수 있습니다.
                </p>
              </div>
            ) : (
              plan.stops.map((stop, index) => (
                <article className="plan-stop" key={stop.id}>
                  <header>
                    <div>
                      <p className="eyebrow">후보 {index + 1}</p>
                      <h3>{stop.title}</h3>
                      <p>{stop.address}</p>
                    </div>
                    <div className="stop-actions">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveStop(index, -1)}
                        aria-label={`${stop.title} 순서 위로`}
                        title="순서 위로"
                      >
                        <ArrowUp size={18} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        disabled={index === plan.stops.length - 1}
                        onClick={() => moveStop(index, 1)}
                        aria-label={`${stop.title} 순서 아래로`}
                        title="순서 아래로"
                      >
                        <ArrowDown size={18} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setPlan((p) => ({
                            ...p,
                            stops: p.stops.filter((s) => s.id !== stop.id),
                          }))
                        }
                      >
                        <Trash2 size={18} aria-hidden="true" /><span className="sr-only">{stop.title} 제거</span>
                      </button>
                    </div>
                  </header>
                  <fieldset className="stop-checks">
                    <legend>내가 확인한 상태</legend>
                    {CHECK_FIELDS.map((label, n) => (
                      <label key={label}>
                        <span>{label}</span>
                        <select
                          value={stop.checks[n]}
                          onChange={(e) =>
                            updateStop(stop.id, {
                              checks: stop.checks.map((s, i) =>
                                i === n ? (e.target.value as CheckStatus) : s,
                              ),
                            })
                          }
                        >
                          <option value="unknown">미확인</option>
                          <option value="confirmed">내가 확인함</option>
                          <option value="blocked">조건 불일치</option>
                        </select>
                      </label>
                    ))}
                  </fieldset>
                  <label className="stop-note">
                    확인 날짜·답변 메모
                    <textarea
                      maxLength={1000}
                      rows={3}
                      value={stop.note}
                      onChange={(e) =>
                        updateStop(stop.id, { note: e.target.value })
                      }
                    />
                  </label>
                </article>
              ))
            )}
          </section>
          <section className="budget-tool" aria-labelledby="budget-title">
            <h2 id="budget-title">확인한 비용 계산</h2>
            <p>
              이번 방문 전체 금액을 원 단위로 입력하세요. 모르면 빈칸, 무료로
              확인했다면 0원을 입력합니다. 자동 가격 추정은 하지 않습니다.
            </p>
            <div className="budget-inputs">
              {COST_LABELS.map((label, i) => (
                <label key={label}>
                  {label}
                  <input
                    type="number"
                    min={0}
                    max={999999999}
                    step={1}
                    inputMode="numeric"
                    value={plan.costs[i]}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || /^\d{1,9}$/.test(value))
                        setPlan((p) => ({
                          ...p,
                          costs: p.costs.map((v, n) => (n === i ? value : v)),
                        }));
                    }}
                  />
                  <span>원</span>
                </label>
              ))}
            </div>
            <dl className="budget-result">
              <div>
                <dt>확인한 비용 합계</dt>
                <dd>{budget.known.toLocaleString("ko-KR")}원</dd>
              </div>
              <div>
                <dt>아직 입력하지 않은 비용</dt>
                <dd>{budget.missing}개 항목</dd>
              </div>
              <div>
                <dt>보증금 포함 준비금</dt>
                <dd>
                  {budget.deposit === null
                    ? "보증금 미확인"
                    : `${(budget.known + budget.deposit).toLocaleString("ko-KR")}원`}
                </dd>
              </div>
            </dl>
            <p>
              합계는 입력한 금액만의 부분 합계이며 실제 견적이 아닙니다. 보증금
              환급 조건도 직접 확인하세요.
            </p>
            <Link to="/pet-travel/guides#budget">계산 단위를 맞추는 방법</Link>
          </section>
          <div className="plan-file-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={download}
              disabled={!ready}
            >
              <Download size={18} aria-hidden="true" /> 계획 파일 내려받기
            </button>
            <label className="file-import">
              계획 파일 불러오기
              <input
                ref={importRef}
                type="file"
                accept=".json,application/json"
                onChange={(e) => void importFile(e.target.files?.[0])}
              />
            </label>
            <button
              type="button"
              className="text-button"
              onClick={clear}
              disabled={!ready}
            >
              계획 전체 삭제
            </button>
            <button
              type="button"
              className="text-button"
              onClick={() => window.print()}
            >
              <Printer size={18} aria-hidden="true" /> 인쇄
            </button>
          </div>
          <p className="muted-copy">
            내려받은 파일에는 개인 메모와 예산이 포함됩니다. 파일은 이 기기에서
            읽고 쓰며 서버로 업로드하지 않습니다. 광고·로그인·결제 없이 이용할
            수 있습니다.
          </p>
        </div>
      </div>
    </main>
  );
}
