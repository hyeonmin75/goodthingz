import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router";

import type { Route } from "./+types/pet-travel";
import type {
	ApiPayload,
	KtoPetTourPlaceDetail,
	KtoPetTourPlaceSummary,
	KtoPetTourPlacesResponse,
} from "../../workers/api/kto-pet-tour/types";
import {
	breadcrumbJsonLd,
	canonicalUrl,
	DATA_PROVIDER,
	DATA_SERVICE,
	DATA_UPDATED,
	webPageJsonLd,
} from "../seo";

const PLACE_TYPES = [
	{ value: "", label: "전체" },
	{ value: "12", label: "관광지" },
	{ value: "14", label: "문화시설" },
	{ value: "15", label: "축제" },
	{ value: "28", label: "레포츠" },
	{ value: "32", label: "숙박" },
	{ value: "38", label: "쇼핑" },
	{ value: "39", label: "음식점" },
];

const RADIUS_OPTIONS = [
	{ value: 1000, label: "1km" },
	{ value: 3000, label: "3km" },
	{ value: 5000, label: "5km" },
	{ value: 10000, label: "10km" },
	{ value: 20000, label: "20km" },
];

const PAGE_SIZE = 12;
const SAVED_PLACES_KEY = "goodthingz.petTravel.savedPlaces";

type Status = "idle" | "loading" | "success" | "empty" | "error";
type SortMode = "distance" | "latest" | "name" | "image";

interface SearchState {
	keyword: string;
	contentTypeId: string;
	radius: number;
	withImagesOnly: boolean;
	includeNeedsCheck: boolean;
	sort: SortMode;
}

interface LocationState {
	latitude: number;
	longitude: number;
}

type DetailLoadState =
	| { status: "idle" }
	| { status: "loading" }
	| { status: "success"; data: KtoPetTourPlaceDetail }
	| { status: "error"; message: string };

export function loader({ request }: Route.LoaderArgs) {
	const url = new URL(request.url);

	return {
		shouldNoindex: url.searchParams.size > 0,
	};
}

export function meta({ data }: Route.MetaArgs) {
	const title = "반려동물 동반여행 검색 - GoodThingz";
	const description =
		"한국관광공사 공공데이터로 반려동물 동반 장소의 거리, 지도, 방문 정보, 동반 조건을 무료로 확인하세요.";
	const shouldNoindex = data?.shouldNoindex ?? false;

	return [
		{ title },
		{
			name: "description",
			content: description,
		},
		{ name: "robots", content: shouldNoindex ? "noindex,follow" : "index,follow" },
		{ tagName: "link", rel: "canonical", href: canonicalUrl("/pet-travel") },
		{
			"script:ld+json": [
				webPageJsonLd({
					name: title,
					description,
					path: "/pet-travel",
				}),
				breadcrumbJsonLd([
					{ name: "홈", path: "/" },
					{ name: "반려동물 여행", path: "/pet-travel" },
				]),
			],
		},
	];
}

export default function PetTravel() {
	const [search, setSearch] = useState<SearchState>({
		keyword: "",
		contentTypeId: "",
		radius: 5000,
		withImagesOnly: false,
		includeNeedsCheck: true,
		sort: "distance",
	});
	const [location, setLocation] = useState<LocationState | null>(null);
	const [data, setData] = useState<KtoPetTourPlacesResponse | null>(null);
	const [status, setStatus] = useState<Status>("idle");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [activePlace, setActivePlace] =
		useState<KtoPetTourPlaceSummary | null>(null);
	const [detailsById, setDetailsById] = useState<
		Record<string, DetailLoadState>
	>({});
	const [compareItems, setCompareItems] = useState<KtoPetTourPlaceSummary[]>([]);
	const [savedItems, setSavedItems] = useState<KtoPetTourPlaceSummary[]>([]);
	const [mobileView, setMobileView] = useState<"list" | "map">("list");
	const [mapFocus, setMapFocus] = useState<"user" | "place">("place");
	const [locationMessage, setLocationMessage] = useState<string | null>(null);
	const [shareMessage, setShareMessage] = useState<string | null>(null);
	const resultsRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		void fetchPlaces({ page: 1 });
	}, []);

	useEffect(() => {
		try {
			const stored = window.localStorage.getItem(SAVED_PLACES_KEY);

			if (stored) {
				setSavedItems(JSON.parse(stored) as KtoPetTourPlaceSummary[]);
			}
		} catch {
			setSavedItems([]);
		}
	}, []);

	const visibleItems = useMemo(() => {
		const items = data?.items ?? [];
		const filtered = items.filter((item) => {
			if (search.withImagesOnly && !item.media.hasImage) {
				return false;
			}

			if (!search.includeNeedsCheck && getInfoStatus(item).tone === "warning") {
				return false;
			}

			return true;
		});

		return [...filtered].sort((a, b) => {
			if (search.sort === "latest") {
				return compareNullableText(b.dates.modifiedAtRaw, a.dates.modifiedAtRaw);
			}

			if (search.sort === "name") {
				return a.title.localeCompare(b.title, "ko-KR");
			}

			if (search.sort === "image") {
				return Number(b.media.hasImage) - Number(a.media.hasImage);
			}

			return compareNullableNumber(
				a.location.distanceMeters,
				b.location.distanceMeters,
			);
		});
	}, [
		data,
		search.includeNeedsCheck,
		search.sort,
		search.withImagesOnly,
	]);

	const selectedIds = new Set(compareItems.map((item) => item.id));
	const savedIds = new Set(savedItems.map((item) => item.id));
	const hasResults = status === "success" && visibleItems.length > 0;
	const emptyBecauseFilters =
		status === "success" &&
		(data?.items.length ?? 0) > 0 &&
		visibleItems.length === 0;
	const activeDetailState = activePlace
		? (detailsById[activePlace.id] ?? { status: "idle" as const })
		: { status: "idle" as const };

	async function fetchPlaces(options?: {
		page?: number;
		useLocation?: boolean;
		append?: boolean;
	}) {
		setStatus("loading");
		setErrorMessage(null);

		const controller = new AbortController();
		const timeoutId = window.setTimeout(() => controller.abort(), 10000);
		const params = new URLSearchParams({
			page: String(options?.page ?? 1),
			pageSize: String(PAGE_SIZE),
		});

		if (search.keyword.trim()) {
			params.set("keyword", search.keyword.trim());
		}

		if (search.contentTypeId) {
			params.set("contentTypeId", search.contentTypeId);
		}

		if (options?.useLocation && location) {
			params.set("latitude", String(location.latitude));
			params.set("longitude", String(location.longitude));
			params.set("radius", String(search.radius));
		}

		try {
			const response = await fetch(
				`/api/public-data/pet-tour/places?${params.toString()}`,
				{ signal: controller.signal },
			);
			const payload =
				(await response.json()) as ApiPayload<KtoPetTourPlacesResponse>;

			if (!payload.ok) {
				throw new Error(payload.error.message);
			}

			setData((current) =>
				options?.append && current
					? {
							...payload.data,
							items: [...current.items, ...payload.data.items],
						}
					: payload.data,
			);
			setStatus(payload.data.empty ? "empty" : "success");

			const nextActive =
				options?.append && activePlace
					? activePlace
					: (payload.data.items[0] ?? null);
			setActivePlace(nextActive);

			if (nextActive) {
				void fetchPlaceDetail(nextActive);
			}

			resultsRef.current?.focus();
		} catch (error) {
			const message =
				error instanceof DOMException && error.name === "AbortError"
					? "응답이 오래 걸려 중단했습니다. 잠시 후 다시 시도해 주세요."
					: error instanceof Error
						? error.message
						: "공공데이터를 잠시 불러오지 못했습니다.";
			setStatus("error");
			setErrorMessage(message);
		} finally {
			window.clearTimeout(timeoutId);
		}
	}

	function handleSearch(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		void fetchPlaces({ page: 1, useLocation: Boolean(location) });
	}

	function requestCurrentLocation() {
		setLocationMessage("현재 위치 권한을 확인하는 중입니다.");

		if (!navigator.geolocation) {
			setLocationMessage("이 브라우저에서는 현재 위치를 사용할 수 없습니다.");
			return;
		}

		navigator.geolocation.getCurrentPosition(
			(position) => {
				const nextLocation = {
					latitude: position.coords.latitude,
					longitude: position.coords.longitude,
				};
				setLocation(nextLocation);
				setLocationMessage("현재 위치 기준으로 주변 후보를 찾습니다.");
				setMobileView("map");
				setMapFocus("user");
				void fetchPlacesWithLocation(nextLocation, search.radius);
			},
			() => {
				setLocationMessage("위치 권한이 없어 전국/키워드 검색으로 진행합니다.");
			},
			{ enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
		);
	}

	async function fetchPlacesWithLocation(
		nextLocation: LocationState,
		radius = search.radius,
	) {
		setStatus("loading");
		setErrorMessage(null);

		const controller = new AbortController();
		const timeoutId = window.setTimeout(() => controller.abort(), 10000);
		const params = new URLSearchParams({
			page: "1",
			pageSize: String(PAGE_SIZE),
			latitude: String(nextLocation.latitude),
			longitude: String(nextLocation.longitude),
			radius: String(radius),
		});

		if (search.contentTypeId) {
			params.set("contentTypeId", search.contentTypeId);
		}

		try {
			const response = await fetch(`/api/public-data/pet-tour/places?${params}`, {
				signal: controller.signal,
			});
			const payload =
				(await response.json()) as ApiPayload<KtoPetTourPlacesResponse>;

			if (!payload.ok) {
				setStatus("error");
				setErrorMessage(payload.error.message);
				return;
			}

			setData(payload.data);
			setStatus(payload.data.empty ? "empty" : "success");
			const firstPlace = payload.data.items[0] ?? null;
			setActivePlace(firstPlace);
			if (firstPlace) {
				void fetchPlaceDetail(firstPlace);
			}
			resultsRef.current?.focus();
		} catch (error) {
			setStatus("error");
			setErrorMessage(
				error instanceof DOMException && error.name === "AbortError"
					? "현재 위치 기준 검색 응답이 오래 걸려 중단했습니다."
					: "현재 위치 기준 검색을 완료하지 못했습니다.",
			);
		} finally {
			window.clearTimeout(timeoutId);
		}
	}

	async function fetchPlaceDetail(item: KtoPetTourPlaceSummary) {
		const current = detailsById[item.id];

		if (current?.status === "loading" || current?.status === "success") {
			return;
		}

		setDetailsById((details) => ({
			...details,
			[item.id]: { status: "loading" },
		}));

		const controller = new AbortController();
		const timeoutId = window.setTimeout(() => controller.abort(), 10000);
		const params = new URLSearchParams({
			contentId: item.source.contentId,
			contentTypeId: item.contentTypeId,
		});

		try {
			const response = await fetch(`/api/public-data/pet-tour/place?${params}`, {
				signal: controller.signal,
			});
			const payload =
				(await response.json()) as ApiPayload<KtoPetTourPlaceDetail>;

			if (!payload.ok) {
				throw new Error(payload.error.message);
			}

			setDetailsById((details) => ({
				...details,
				[item.id]: { status: "success", data: payload.data },
			}));
		} catch (error) {
			setDetailsById((details) => ({
				...details,
				[item.id]: {
					status: "error",
					message:
						error instanceof DOMException && error.name === "AbortError"
							? "상세 정보 응답이 오래 걸려 중단했습니다."
							: error instanceof Error
								? error.message
								: "상세 정보를 불러오지 못했습니다.",
				},
			}));
		} finally {
			window.clearTimeout(timeoutId);
		}
	}

	function updateSearch<Key extends keyof SearchState>(
		key: Key,
		value: SearchState[Key],
	) {
		setSearch((current) => ({ ...current, [key]: value }));
	}

	function resetFilters() {
		setSearch((current) => ({
			...current,
			contentTypeId: "",
			withImagesOnly: false,
			includeNeedsCheck: true,
			sort: "distance",
		}));
	}

	function selectPlace(item: KtoPetTourPlaceSummary) {
		setActivePlace(item);
		setMapFocus("place");
		void fetchPlaceDetail(item);
	}

	function handleRadiusChange(radius: number) {
		setSearch((current) => ({ ...current, radius }));

		if (location) {
			setLocationMessage(`${formatDistance(radius)} 반경으로 다시 찾습니다.`);
			void fetchPlacesWithLocation(location, radius);
		} else {
			setLocationMessage("반경 검색은 내 위치 조회 후 적용됩니다.");
		}
	}

	function toggleCompare(item: KtoPetTourPlaceSummary) {
		setCompareItems((current) => {
			if (current.some((candidate) => candidate.id === item.id)) {
				return current.filter((candidate) => candidate.id !== item.id);
			}

			if (current.length >= 3) {
				return [current[1], current[2], item].filter(Boolean);
			}

			return [...current, item];
		});
	}

	function savePlace(item: KtoPetTourPlaceSummary) {
		setSavedItems((current) => {
			const exists = current.some((candidate) => candidate.id === item.id);
			const next = exists
				? current.filter((candidate) => candidate.id !== item.id)
				: [item, ...current].slice(0, 12);
			persistSavedPlaces(next);
			setShareMessage(
				exists ? "저장한 장소에서 제거했습니다." : "선택한 장소를 저장했습니다.",
			);
			return next;
		});
	}

	function clearSavedPlaces() {
		setSavedItems([]);
		persistSavedPlaces([]);
		setShareMessage("저장한 장소를 비웠습니다.");
	}

	async function sharePlaces(items: KtoPetTourPlaceSummary[], label = "내 루트") {
		if (items.length === 0) {
			setShareMessage("공유할 장소를 먼저 선택해 주세요.");
			return;
		}

		const text = buildShareText(items, label);

		try {
			if (navigator.share) {
				await navigator.share({
					title: `GoodThingz ${label}`,
					text,
					url: window.location.origin + "/pet-travel",
				});
				setShareMessage("공유를 준비했습니다.");
				return;
			}

			await navigator.clipboard.writeText(text);
			setShareMessage("공유할 내용을 클립보드에 복사했습니다.");
		} catch {
			setShareMessage(
				"공유를 완료하지 못했습니다. 브라우저 권한을 확인해 주세요.",
			);
		}
	}

	return (
		<main className="service-page">
			<header className="service-header">
				<nav className="top-nav" aria-label="주요 메뉴">
					<Link className="brand" to="/">
						<span className="brand-mark" aria-hidden="true">
							G
						</span>
						<span>GoodThingz</span>
					</Link>
					<div className="nav-links">
						<Link to="/">홈</Link>
						<Link to="/data-sources/kto-pet-tour">데이터 출처</Link>
						<a href="#results">결과</a>
					</div>
				</nav>

				<nav className="breadcrumb" aria-label="현재 위치">
					<Link to="/">홈</Link>
					<span aria-hidden="true">/</span>
					<span>반려동물 여행</span>
				</nav>

				<section className="service-intro" aria-labelledby="service-title">
					<div>
						<p className="eyebrow">반려동물 동반여행 검색</p>
						<h1 id="service-title">함께 갈 수 있는 곳 찾기</h1>
						<p className="lead">
							동반 조건, 거리, 지도를 한 화면에서 빠르게 확인하세요.
						</p>
						<p className="source-inline">
							출처: {DATA_PROVIDER} {DATA_SERVICE} · 데이터 갱신 기준{" "}
							{DATA_UPDATED}
						</p>
					</div>
					<div className="intro-proof" aria-label="서비스가 제공하는 결과">
						<strong>입력하면 얻는 것</strong>
						<span>주변 후보</span>
						<span>동반 조건</span>
						<span>2~3곳 비교</span>
					</div>
				</section>
			</header>

			<section className="search-shell" aria-label="검색과 필터">
				<form className="search-form" onSubmit={handleSearch}>
					<label className="input-field">
						<span>장소명 또는 목적</span>
						<input
							type="search"
							value={search.keyword}
							onChange={(event) => updateSearch("keyword", event.target.value)}
							placeholder="예: 카페, 공원, 숙박"
							autoComplete="off"
						/>
					</label>

					<label className="input-field compact">
						<span>장소 유형</span>
						<select
							value={search.contentTypeId}
							onChange={(event) =>
								updateSearch("contentTypeId", event.target.value)
							}
						>
							{PLACE_TYPES.map((type) => (
								<option key={type.value || "all"} value={type.value}>
									{type.label}
								</option>
							))}
						</select>
					</label>

					<button className="button button-primary" type="submit">
						검색
					</button>
					<button
						className="button button-secondary"
						type="button"
						onClick={requestCurrentLocation}
					>
						내 위치 조회
					</button>
				</form>

				{locationMessage ? (
					<p className="assistive-message" role="status">
						{locationMessage}
					</p>
				) : null}

				<div className="filter-row" aria-label="스마트 필터">
					<fieldset>
						<legend>반경</legend>
						<div className="segmented">
							{RADIUS_OPTIONS.map((option) => (
								<button
									key={option.value}
									type="button"
									className={search.radius === option.value ? "selected" : ""}
									onClick={() => handleRadiusChange(option.value)}
									aria-pressed={search.radius === option.value}
									disabled={!location}
									title={
										location
											? `${option.label} 안의 장소를 찾습니다.`
											: "내 위치 조회 후 반경을 선택할 수 있습니다."
									}
								>
									{option.label}
								</button>
							))}
						</div>
					</fieldset>

					<label className="toggle">
						<input
							type="checkbox"
							checked={search.withImagesOnly}
							onChange={(event) =>
								updateSearch("withImagesOnly", event.target.checked)
							}
						/>
						<span>사진 있음</span>
					</label>

					<label className="toggle">
						<input
							type="checkbox"
							checked={search.includeNeedsCheck}
							onChange={(event) =>
								updateSearch("includeNeedsCheck", event.target.checked)
							}
						/>
						<span>확인 필요 포함</span>
					</label>

					<label className="sort-control">
						<span>정렬</span>
						<select
							value={search.sort}
							onChange={(event) =>
								updateSearch("sort", event.target.value as SortMode)
							}
						>
							<option value="distance">거리순</option>
							<option value="latest">최신 수정순</option>
							<option value="name">이름순</option>
							<option value="image">사진 있는 결과 우선</option>
						</select>
					</label>

					<button className="text-button" type="button" onClick={resetFilters}>
						필터 초기화
					</button>
				</div>
			</section>

			<div className="mobile-tabs" role="tablist" aria-label="모바일 결과 보기">
				<button
					type="button"
					className={mobileView === "list" ? "active" : ""}
					onClick={() => setMobileView("list")}
					aria-pressed={mobileView === "list"}
				>
					목록
				</button>
				<button
					type="button"
					className={mobileView === "map" ? "active" : ""}
					onClick={() => setMobileView("map")}
					aria-pressed={mobileView === "map"}
				>
					지도와 상세
				</button>
			</div>

			<section className="workspace" aria-label="검색 결과 작업 영역">
				<div
					id="results"
					className={`results-panel ${mobileView === "map" ? "mobile-hidden" : ""}`}
					tabIndex={-1}
					ref={resultsRef}
				>
					<div className="panel-heading">
						<div>
							<p className="eyebrow">검색 결과</p>
							<h2>
								{status === "loading"
									? "후보를 확인하고 있습니다"
									: `${visibleItems.length.toLocaleString("ko-KR")}곳 표시 중`}
							</h2>
						</div>
						<p className="source-note">
							출처: {data?.source.provider ?? "한국관광공사"} · 갱신 기준{" "}
							{data?.source.dataUpdated ?? "일 1회"}
						</p>
					</div>

					{status === "loading" ? <LoadingSkeleton /> : null}
					{status === "error" ? (
						<ErrorState
							message={errorMessage}
							onRetry={() =>
								void fetchPlaces({ page: 1, useLocation: Boolean(location) })
							}
						/>
					) : null}
					{status === "empty" || emptyBecauseFilters ? (
						<EmptyState
							onReset={resetFilters}
							onRetry={() =>
								void fetchPlaces({ page: 1, useLocation: Boolean(location) })
							}
						/>
					) : null}
					{hasResults ? (
						<div className="result-list" aria-live="polite">
							{visibleItems.map((item) => (
								<PlaceCard
									key={item.id}
									item={item}
									detailState={detailsById[item.id] ?? { status: "idle" }}
									isSelected={activePlace?.id === item.id}
									isCompared={selectedIds.has(item.id)}
									isSaved={savedIds.has(item.id)}
									onSelect={() => selectPlace(item)}
									onCompare={() => toggleCompare(item)}
									onSave={() => savePlace(item)}
								/>
							))}
						</div>
					) : null}

					{data?.pagination.hasNextPage ? (
						<button
							className="button button-secondary wide"
							type="button"
							onClick={() =>
								void fetchPlaces({
									page: data.pagination.page + 1,
									useLocation: Boolean(location),
									append: true,
								})
							}
						>
							다음 결과 보기
						</button>
					) : null}
				</div>

				<div className={`map-panel ${mobileView === "list" ? "mobile-hidden" : ""}`}>
					<MapPanel
						activePlace={activePlace}
						userLocation={location}
						focus={mapFocus}
						onFocusChange={setMapFocus}
						onLocate={requestCurrentLocation}
					/>
					{activePlace ? (
						<DetailPanel
							item={activePlace}
							detailState={activeDetailState}
							isCompared={selectedIds.has(activePlace.id)}
							isSaved={savedIds.has(activePlace.id)}
							onCompare={() => toggleCompare(activePlace)}
							onSave={() => savePlace(activePlace)}
							onShare={() => void sharePlaces([activePlace], "선택 장소")}
							onRetry={() => void fetchPlaceDetail(activePlace)}
							onClose={() => setActivePlace(null)}
						/>
					) : null}
					{savedItems.length > 0 ? (
						<SavedPlacesPanel
							items={savedItems}
							onSelect={selectPlace}
							onShare={() => void sharePlaces(savedItems, "저장한 장소")}
							onClear={clearSavedPlaces}
						/>
					) : null}
				</div>
			</section>

			{compareItems.length > 0 ? (
				<CompareTray
					items={compareItems}
					onShare={() => void sharePlaces(compareItems, "내 루트")}
					onRemove={(id) =>
						setCompareItems((current) =>
							current.filter((item) => item.id !== id),
						)
					}
					onClear={() => setCompareItems([])}
				/>
			) : null}
			{shareMessage ? (
				<p className="toast-message" role="status">
					{shareMessage}
				</p>
			) : null}
		</main>
	);
}

function PlaceCard({
	item,
	detailState,
	isSelected,
	isCompared,
	isSaved,
	onSelect,
	onCompare,
	onSave,
}: {
	item: KtoPetTourPlaceSummary;
	detailState: DetailLoadState;
	isSelected: boolean;
	isCompared: boolean;
	isSaved: boolean;
	onSelect: () => void;
	onCompare: () => void;
	onSave: () => void;
}) {
	const detail = detailState.status === "success" ? detailState.data : null;
	const status = getInfoStatus(item, detail);

	return (
		<article className={`place-card ${isSelected ? "selected" : ""}`}>
			<button className="place-card-main" type="button" onClick={onSelect}>
				<ImageFrame item={item} />
				<span className="place-copy">
					<span className="place-topline">
						<strong>{item.title}</strong>
						<span className="type-pill">{item.contentTypeName}</span>
					</span>
					<span className="place-meta">
						{formatDistance(item.location.distanceMeters)} ·{" "}
						{item.address.full ?? "주소 정보 없음"}
					</span>
					<span className={`status-badge ${status.tone}`}>{status.label}</span>
					<span className="condition-summary">{status.summary}</span>
				</span>
			</button>
			<div className="card-actions">
				<button className="text-button" type="button" onClick={onSelect}>
					상세 조건
				</button>
				<button
					className="text-button"
					type="button"
					onClick={onCompare}
					aria-pressed={isCompared}
				>
					{isCompared ? "루트 해제" : "루트 추가"}
				</button>
				<button
					className="text-button"
					type="button"
					onClick={onSave}
					aria-pressed={isSaved}
				>
					{isSaved ? "저장 해제" : "저장"}
				</button>
				{detailState.status === "loading" ? (
					<span className="muted-action" role="status">
						상세 확인 중
					</span>
				) : null}
			</div>
		</article>
	);
}

function ImageFrame({ item }: { item: KtoPetTourPlaceSummary }) {
	if (!item.media.thumbnailImageUrl && !item.media.primaryImageUrl) {
		return <span className="image-fallback">사진 없음</span>;
	}

	return (
		<img
			className="place-image"
			src={item.media.thumbnailImageUrl ?? item.media.primaryImageUrl ?? ""}
			alt={`${item.title} 대표 이미지`}
			loading="lazy"
		/>
	);
}

function MapPanel({
	activePlace,
	userLocation,
	focus,
	onFocusChange,
	onLocate,
}: {
	activePlace: KtoPetTourPlaceSummary | null;
	userLocation: LocationState | null;
	focus: "user" | "place";
	onFocusChange: (focus: "user" | "place") => void;
	onLocate: () => void;
}) {
	const embedUrl = getOpenStreetMapEmbedUrl(activePlace, userLocation, focus);
	const directionsUrl =
		activePlace && userLocation ? getDirectionsUrl(activePlace, userLocation) : null;
	const canFocusPlace = Boolean(activePlace?.location.latitude);
	const canFocusUser = Boolean(userLocation);

	return (
		<section className="map-card" aria-labelledby="map-title">
			<div className="panel-heading compact-heading">
				<div>
					<p className="eyebrow">좌표 기반 위치 보기</p>
					<h2 id="map-title">
						{focus === "user" ? "내 위치 지도" : "선택한 장소 지도"}
					</h2>
				</div>
				<button
					className="button button-secondary compact-button"
					type="button"
					onClick={onLocate}
				>
					내 위치 조회
				</button>
			</div>
			<div className="map-focus-tabs" aria-label="지도 중심 선택">
				<button
					type="button"
					className={focus === "user" ? "selected" : ""}
					onClick={() => onFocusChange("user")}
					disabled={!canFocusUser}
					aria-pressed={focus === "user"}
				>
					내 위치
				</button>
				<button
					type="button"
					className={focus === "place" ? "selected" : ""}
					onClick={() => onFocusChange("place")}
					disabled={!canFocusPlace}
					aria-pressed={focus === "place"}
				>
					선택 장소
				</button>
			</div>
			<div className="map-canvas">
				{embedUrl ? (
					<iframe
						title={
							focus === "user"
								? "내 위치 지도"
								: `${activePlace?.title ?? "선택한 장소"} 지도`
						}
						src={embedUrl}
						loading="lazy"
						referrerPolicy="no-referrer-when-downgrade"
					/>
				) : (
					<p>좌표가 있는 장소를 선택하면 지도가 표시됩니다.</p>
				)}
			</div>
			{directionsUrl ? (
				<a
					className="text-button map-link"
					href={directionsUrl}
					target="_blank"
					rel="noreferrer"
				>
					내 위치에서 길찾기 열기
				</a>
			) : null}
			<p className="map-note">
				내 위치 조회는 브라우저 권한이 필요합니다. 지도는 공공데이터 좌표와
				사용자 위치를 기준으로 표시하며, 실제 이동시간과 영업 상태는 제공하지
				않습니다.
			</p>
		</section>
	);
}

function DetailPanel({
	item,
	detailState,
	isCompared,
	isSaved,
	onCompare,
	onSave,
	onShare,
	onRetry,
	onClose,
}: {
	item: KtoPetTourPlaceSummary;
	detailState: DetailLoadState;
	isCompared: boolean;
	isSaved: boolean;
	onCompare: () => void;
	onSave: () => void;
	onShare: () => void;
	onRetry: () => void;
	onClose: () => void;
}) {
	const detail = detailState.status === "success" ? detailState.data : null;
	const status = getInfoStatus(item, detail);
	const tel = detail?.contact.tel ?? item.contact.tel;
	const infoCenter = detail?.contact.infoCenter;
	const address = detail?.address.full ?? item.address.full;
	const images = detail?.images ?? [];

	return (
		<aside className="detail-panel" aria-labelledby="detail-title">
			<div className="detail-top">
				<div>
					<p className="eyebrow">방문 판단 카드</p>
					<h2 id="detail-title">{detail?.title ?? item.title}</h2>
					<p>{address ?? "주소 정보 없음"}</p>
				</div>
				<button className="icon-button" type="button" onClick={onClose}>
					닫기
				</button>
			</div>

			<div className={`status-callout ${status.tone}`}>
				<strong>{status.label}</strong>
				<span>{status.summary}</span>
			</div>

			{detailState.status === "loading" ? <DetailSkeleton /> : null}
			{detailState.status === "error" ? (
				<div className="inline-error" role="alert">
					<p>{detailState.message}</p>
					<button className="text-button" type="button" onClick={onRetry}>
						상세 정보 다시 불러오기
					</button>
				</div>
			) : null}

			{detail ? (
				<>
					{images.length > 0 ? (
						<div className="detail-images" aria-label="장소 이미지">
							{images.slice(0, 3).map((image, index) => (
								<img
									key={`${image.originImageUrl ?? image.thumbnailImageUrl}-${index}`}
									src={image.thumbnailImageUrl ?? image.originImageUrl ?? ""}
									alt={image.name ?? `${item.title} 이미지 ${index + 1}`}
									loading="lazy"
								/>
							))}
						</div>
					) : null}

					{detail.overview ? (
						<section className="detail-section">
							<h3>장소 개요</h3>
							<p>{detail.overview}</p>
						</section>
					) : null}

					<div className="quick-facts" aria-label="핵심 동반 조건">
						<div>
							<span>동반 조건</span>
							<strong>
								{detail.petPolicy.hasPetPolicy
									? "상세 조건 있음"
									: "공식 데이터 없음"}
							</strong>
						</div>
						<div>
							<span>준비물</span>
							<strong>
								{detail.petPolicy.requiredItems ? "준비물 안내 있음" : "방문 전 확인"}
							</strong>
						</div>
						<div>
							<span>현장 확인</span>
							<strong>
								{tel || infoCenter ? "연락처 있음" : "연락처 없음"}
							</strong>
						</div>
					</div>

					<InfoGrid
						title="반려동물 동반 조건"
						emptyText="공식 데이터에 반려동물 상세 조건이 없습니다."
						items={[
							["동반 유형", detail.petPolicy.companionshipType],
							["동반 가능 동물", detail.petPolicy.allowedPets],
							["필요사항", detail.petPolicy.requiredItems],
							["기타 안내", detail.petPolicy.policyNotes],
							["구비 시설", detail.petPolicy.facilities],
							["비치 품목", detail.petPolicy.providedItems],
							["구매 품목", detail.petPolicy.purchasableItems],
							["렌탈 품목", detail.petPolicy.rentalItems],
							["사고 대비", detail.petPolicy.riskNotes],
						]}
					/>

					<InfoGrid
						title="방문 전 확인 정보"
						emptyText="공식 데이터에 운영시간, 휴무, 주차 등 방문 정보가 없습니다."
						items={[
							["운영시간", detail.visitInfo.hours],
							["휴무일", detail.visitInfo.closedDays],
							["주차", detail.visitInfo.parking],
							["예약", detail.visitInfo.reservation],
							["요금", detail.visitInfo.fee],
							["입퇴실", detail.visitInfo.checkInOut],
							["행사 기간", detail.visitInfo.eventPeriod],
							["대표 메뉴", detail.visitInfo.mainMenu],
							...detail.visitInfo.additionalNotes.map(
								(note) => ["참고", note] as [string, string],
							),
						]}
					/>

					<dl className="decision-list">
						<div>
							<dt>장소 유형</dt>
							<dd>{item.contentTypeName}</dd>
						</div>
						<div>
							<dt>거리</dt>
							<dd>{formatDistance(item.location.distanceMeters)}</dd>
						</div>
						<div>
							<dt>연락처</dt>
							<dd>{tel ?? infoCenter ?? "공식 데이터에 연락처 없음"}</dd>
						</div>
						<div>
							<dt>수정일</dt>
							<dd>{formatRawDate(item.dates.modifiedAtRaw)}</dd>
						</div>
					</dl>

					<div className="detail-actions">
						{tel ? (
							<a className="button button-primary" href={`tel:${tel}`}>
								전화
							</a>
						) : null}
						{detail.homepageUrl ? (
							<a
								className="button button-secondary"
								href={detail.homepageUrl}
								target="_blank"
								rel="noreferrer"
							>
								홈페이지
							</a>
						) : null}
						<button
							className="button button-secondary"
							type="button"
							onClick={onCompare}
						>
							{isCompared ? "루트에서 빼기" : "루트 추가"}
						</button>
						<button
							className="button button-secondary"
							type="button"
							onClick={onSave}
							aria-pressed={isSaved}
						>
							{isSaved ? "저장 해제" : "저장"}
						</button>
						<button
							className="button button-secondary"
							type="button"
							onClick={onShare}
						>
							공유
						</button>
					</div>

					<p className="detail-note">
						실시간 영업, 예약 가능 여부, 가격, 리뷰는 공식 API에서 확인되지
						않아 표시하지 않습니다. 조건이 중요하면 방문 전 최종 확인이
						필요합니다.
					</p>
				</>
			) : null}
		</aside>
	);
}

function InfoGrid({
	title,
	items,
	emptyText,
}: {
	title: string;
	items: Array<[string, string | null]>;
	emptyText: string;
}) {
	const visibleItems = items.filter(([, value]) => Boolean(value));

	return (
		<section className="detail-section">
			<h3>{title}</h3>
			{visibleItems.length > 0 ? (
				<dl className="info-grid">
					{visibleItems.map(([label, value], index) => (
						<div key={`${label}-${index}`}>
							<dt>{label}</dt>
							<dd>{value}</dd>
						</div>
					))}
				</dl>
			) : (
				<p className="muted-copy">{emptyText}</p>
			)}
		</section>
	);
}

function SavedPlacesPanel({
	items,
	onSelect,
	onShare,
	onClear,
}: {
	items: KtoPetTourPlaceSummary[];
	onSelect: (item: KtoPetTourPlaceSummary) => void;
	onShare: () => void;
	onClear: () => void;
}) {
	return (
		<section className="saved-panel" aria-labelledby="saved-title">
			<div className="compare-header">
				<div>
					<p className="eyebrow">저장한 장소</p>
					<h2 id="saved-title">{items.length}곳 저장됨</h2>
				</div>
				<div className="saved-actions">
					<button className="text-button" type="button" onClick={onShare}>
						공유
					</button>
					<button className="text-button" type="button" onClick={onClear}>
						비우기
					</button>
				</div>
			</div>
			<div className="saved-list">
				{items.slice(0, 6).map((item) => (
					<button key={item.id} type="button" onClick={() => onSelect(item)}>
						<strong>{item.title}</strong>
						<span>{item.address.full ?? item.contentTypeName}</span>
					</button>
				))}
			</div>
		</section>
	);
}

function CompareTray({
	items,
	onShare,
	onRemove,
	onClear,
}: {
	items: KtoPetTourPlaceSummary[];
	onShare: () => void;
	onRemove: (id: string) => void;
	onClear: () => void;
}) {
	return (
		<section className="compare-tray" aria-labelledby="compare-title">
			<div className="compare-header">
				<div>
					<p className="eyebrow">내 루트</p>
					<h2 id="compare-title">{items.length}곳 선택됨</h2>
				</div>
				<div className="saved-actions">
					<button className="text-button" type="button" onClick={onShare}>
						공유
					</button>
					<button className="text-button" type="button" onClick={onClear}>
						전체 비우기
					</button>
				</div>
			</div>
			<div className="compare-grid">
				{items.map((item) => {
					const status = getInfoStatus(item);
					return (
						<article key={item.id} className="compare-card">
							<div>
								<strong>{item.title}</strong>
								<span>{item.contentTypeName}</span>
							</div>
							<dl>
								<div>
									<dt>거리</dt>
									<dd>{formatDistance(item.location.distanceMeters)}</dd>
								</div>
								<div>
									<dt>위치</dt>
									<dd>{item.location.latitude ? "지도 가능" : "좌표 없음"}</dd>
								</div>
								<div>
									<dt>상태</dt>
									<dd>{status.label}</dd>
								</div>
							</dl>
							<button
								className="text-button"
								type="button"
								onClick={() => onRemove(item.id)}
							>
								후보 제거
							</button>
						</article>
					);
				})}
			</div>
		</section>
	);
}

function LoadingSkeleton() {
	return (
		<div className="skeleton-list" aria-label="반려동물 동반여행 데이터 확인 중">
			{Array.from({ length: 5 }).map((_, index) => (
				<div className="skeleton-card" key={index}>
					<span />
					<div>
						<i />
						<i />
						<i />
					</div>
				</div>
			))}
		</div>
	);
}

function DetailSkeleton() {
	return (
		<div className="detail-skeleton" aria-label="상세 정보 확인 중">
			<i />
			<i />
			<i />
		</div>
	);
}

function EmptyState({
	onReset,
	onRetry,
}: {
	onReset: () => void;
	onRetry: () => void;
}) {
	return (
		<div className="state-box">
			<h2>조건에 맞는 후보를 찾지 못했습니다.</h2>
			<p>
				반경을 넓히거나 필터를 줄여보세요. 빈 결과는 오류가 아니라 현재
				공식 데이터와 조건 안에서 표시할 후보가 없다는 뜻입니다.
			</p>
			<div className="state-actions">
				<button className="button button-primary" type="button" onClick={onReset}>
					필터 줄이기
				</button>
				<button className="button button-secondary" type="button" onClick={onRetry}>
					다시 검색
				</button>
			</div>
		</div>
	);
}

function ErrorState({
	message,
	onRetry,
}: {
	message: string | null;
	onRetry: () => void;
}) {
	return (
		<div className="state-box error" role="alert">
			<h2>공공데이터를 불러오지 못했습니다.</h2>
			<p>{message ?? "잠시 후 다시 시도해 주세요."}</p>
			<button className="button button-primary" type="button" onClick={onRetry}>
				다시 시도
			</button>
		</div>
	);
}

function getInfoStatus(
	item: KtoPetTourPlaceSummary,
	detail?: KtoPetTourPlaceDetail | null,
) {
	if (detail?.petPolicy.hasPetPolicy) {
		return {
			label: "동반 조건 확인됨",
			summary: "동반 가능 동물과 필요사항을 상세 정보에서 확인할 수 있습니다.",
			tone: "success" as const,
		};
	}

	if (item.location.latitude && item.location.longitude && item.address.full) {
		return {
			label: "위치 확인됨",
			summary: "주소와 좌표가 있어 지도에서 위치를 먼저 확인할 수 있습니다.",
			tone: "neutral" as const,
		};
	}

	return {
		label: "확인 필요",
		summary: "공식 데이터 일부가 비어 있어 방문 전 추가 확인이 필요합니다.",
		tone: "warning" as const,
	};
}

function getOpenStreetMapEmbedUrl(
	item: KtoPetTourPlaceSummary | null,
	userLocation: LocationState | null,
	focus: "user" | "place",
) {
	const latitude =
		focus === "user"
			? (userLocation?.latitude ?? null)
			: (item?.location.latitude ?? userLocation?.latitude ?? null);
	const longitude =
		focus === "user"
			? (userLocation?.longitude ?? null)
			: (item?.location.longitude ?? userLocation?.longitude ?? null);

	if (latitude === null || longitude === null) {
		return null;
	}

	const delta = 0.01;
	const bbox = [
		longitude - delta,
		latitude - delta,
		longitude + delta,
		latitude + delta,
	].join(",");

	return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
		bbox,
	)}&layer=mapnik&marker=${encodeURIComponent(`${latitude},${longitude}`)}`;
}

function getDirectionsUrl(
	item: KtoPetTourPlaceSummary,
	userLocation: LocationState,
) {
	const latitude = item.location.latitude;
	const longitude = item.location.longitude;

	if (latitude === null || longitude === null) {
		return null;
	}

	return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_foot&route=${encodeURIComponent(
		`${userLocation.latitude},${userLocation.longitude};${latitude},${longitude}`,
	)}`;
}

function persistSavedPlaces(items: KtoPetTourPlaceSummary[]) {
	try {
		window.localStorage.setItem(SAVED_PLACES_KEY, JSON.stringify(items));
	} catch {
		return;
	}
}

function buildShareText(items: KtoPetTourPlaceSummary[], label: string) {
	const lines = items.map((item, index) => {
		const address = item.address.full ?? "주소 정보 없음";
		const distance = formatDistance(item.location.distanceMeters);
		return `${index + 1}. ${item.title} (${item.contentTypeName}) - ${address} - ${distance}`;
	});

	return [`GoodThingz ${label}`, ...lines, "https://goodthingz.com/pet-travel"].join(
		"\n",
	);
}

function formatDistance(distanceMeters: number | null) {
	if (distanceMeters === null) {
		return "거리 정보 없음";
	}

	if (distanceMeters >= 1000) {
		return `${(distanceMeters / 1000).toFixed(1)}km`;
	}

	return `${Math.round(distanceMeters)}m`;
}

function formatRawDate(value: string | null) {
	if (!value || value.length < 8) {
		return "수정일 정보 없음";
	}

	return `${value.slice(0, 4)}.${value.slice(4, 6)}.${value.slice(6, 8)}`;
}

function compareNullableNumber(a: number | null, b: number | null) {
	if (a === null && b === null) {
		return 0;
	}

	if (a === null) {
		return 1;
	}

	if (b === null) {
		return -1;
	}

	return a - b;
}

function compareNullableText(a: string | null, b: string | null) {
	if (a === null && b === null) {
		return 0;
	}

	if (a === null) {
		return 1;
	}

	if (b === null) {
		return -1;
	}

	return a.localeCompare(b, "ko-KR");
}
