export const PLAN_KEY = "goodthingz.visitPlan.v1";
export const SAVED_KEY = "goodthingz.petTravel.savedPlaces";
export const CHECK_FIELDS = [
  "동물·체중·마릿수",
  "동반 구역·준비물",
  "방문일 운영·예약",
  "요금·주차",
] as const;
export type CheckStatus = "unknown" | "confirmed" | "blocked";
export const CHECK_LABELS: Record<CheckStatus, string> = {
  unknown: "미확인", confirmed: "내가 확인함", blocked: "조건 불일치",
};
export interface PlanStop {
  id: string;
  title: string;
  address: string;
  checks: CheckStatus[];
  note: string;
}
export interface VisitPlan {
  version: 1;
  date: string;
  stops: PlanStop[];
  costs: string[];
}
export const COST_LABELS = [
  "이용·숙박료",
  "반려동물 추가비",
  "주차·이동비",
  "식비·기타",
  "환급 조건이 있는 보증금",
];
export const emptyPlan = (): VisitPlan => ({
  version: 1,
  date: "",
  stops: [],
  costs: ["", "", "", "", ""],
});

export function parsePlan(value: unknown): VisitPlan | null {
  if (!value || typeof value !== "object") return null;
  const p = value as VisitPlan;
  if (
    p.version !== 1 ||
    typeof p.date !== "string" ||
    (p.date !== "" && !/^\d{4}-\d{2}-\d{2}$/.test(p.date)) ||
    !Array.isArray(p.stops) ||
    p.stops.length > 6 ||
    !Array.isArray(p.costs) ||
    p.costs.length !== 5
  )
    return null;
  if (p.date) {
    const timestamp = Date.parse(`${p.date}T00:00:00.000Z`);
    if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== p.date) return null;
  }
  if (
    !p.costs.every(
      (v) => typeof v === "string" && (v === "" || /^\d{1,9}$/.test(v)),
    )
  )
    return null;
  if (
    !p.stops.every(
      (s) =>
        s &&
        typeof s.id === "string" &&
        s.id.trim().length > 0 &&
        s.id.length <= 100 &&
        typeof s.title === "string" &&
        s.title.trim().length > 0 &&
        s.title.length <= 200 &&
        typeof s.address === "string" &&
        s.address.length <= 500 &&
        typeof s.note === "string" &&
        s.note.length <= 1000 &&
        Array.isArray(s.checks) &&
        s.checks.length === CHECK_FIELDS.length &&
        s.checks.every((v) => ["unknown", "confirmed", "blocked"].includes(v)),
    )
  )
    return null;
  if (new Set(p.stops.map((s) => s.id)).size !== p.stops.length) return null;
  return {
    version: 1,
    date: p.date,
    costs: [...p.costs],
    stops: p.stops.map(({ id, title, address, note, checks }) => ({
      id,
      title,
      address,
      note,
      checks: [...checks],
    })),
  };
}

export function costSummary(costs: string[]) {
  return {
    known: costs
      .slice(0, 4)
      .reduce((sum, value) => sum + Number(value || 0), 0),
    missing: costs.slice(0, 4).filter((v) => v === "").length,
    deposit: costs[4] === "" ? null : Number(costs[4]),
  };
}

export function planShareText(plan: VisitPlan) {
  return [
    "GoodThingz 방문 후보 계획",
    plan.date ? `방문 예정일: ${plan.date}` : "방문일 미정",
    ...plan.stops.map(
      (s, i) =>
        `${i + 1}. ${s.title}\n${s.address || "주소 없음"}\n${CHECK_FIELDS.map((label, n) => `${label}: ${{ unknown: "미확인", confirmed: "내가 확인함", blocked: "조건 불일치" }[s.checks[n]]}`).join(" / ")}`,
    ),
    "개인 메모·예산·현재 위치는 공유에 포함하지 않았습니다.",
    "직접 기록한 확인 상태이며 사이트의 입장 보증이나 최적 이동 경로가 아닙니다.",
    "https://goodthingfor.com/pet-travel",
  ].join("\n\n");
}

export function stopReviewStatus(stop: PlanStop): CheckStatus {
  if (stop.checks.includes("blocked")) return "blocked";
  return stop.checks.every(status => status === "confirmed") ? "confirmed" : "unknown";
}

export function planReviewSummary(plan: VisitPlan) {
  const checks = plan.stops.flatMap(stop => stop.checks);
  return {
    total: checks.length,
    confirmed: checks.filter(status => status === "confirmed").length,
    unknown: checks.filter(status => status === "unknown").length,
    blocked: checks.filter(status => status === "blocked").length,
    completedStops: plan.stops.filter(stop => stopReviewStatus(stop) === "confirmed").length,
  };
}

export function planReviewTasks(plan: VisitPlan) {
  return plan.stops.flatMap((stop, stopIndex) => stop.checks.flatMap((status, fieldIndex) =>
    status === "confirmed" ? [] : [{ stopIndex, fieldIndex, title: stop.title, field: CHECK_FIELDS[fieldIndex], status }],
  )).sort((a, b) => Number(b.status === "blocked") - Number(a.status === "blocked"));
}

// Quote CSV fields and neutralize spreadsheet formulas, including whitespace-prefixed input.
function csvCell(value: string) {
  const safe = /^[\s]*[=+@-]/.test(value) || /^[\t\r\n]/.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function planComparisonCsv(plan: VisitPlan) {
  const rows = [
    ["장소", "주소", ...CHECK_FIELDS, "확인 상태", "기록 기준"],
    ...plan.stops.map(stop => [stop.title, stop.address, ...stop.checks.map(status => CHECK_LABELS[status]),
      stopReviewStatus(stop) === "confirmed" ? "4항목 직접 확인" : CHECK_LABELS[stopReviewStatus(stop)],
      "사용자 기록·입장 보증 아님" ]),
  ];
  return "\uFEFF" + rows.map(row => row.map(csvCell).join(",")).join("\r\n") + "\r\n";
}
