import type {
	PublicDataResponse,
	PublicDataXmlError,
	RawKtoPetTourListItem,
} from "./types";

const BASE_URL = "https://apis.data.go.kr/B551011/KorPetTourService2";
const NORMAL_RESULT_CODES = new Set(["00", "0000"]);
const EMPTY_RESULT_CODE = "03";

export interface KtoPetTourClientSuccess<TItem> {
	ok: true;
	data: PublicDataResponse<TItem>;
}

export interface KtoPetTourClientFailure {
	ok: false;
	status: number;
	code: string;
	message: string;
	details?: unknown;
}

export type KtoPetTourClientResult<TItem> =
	| KtoPetTourClientSuccess<TItem>
	| KtoPetTourClientFailure;

export async function requestKtoPetTourJson<TItem = RawKtoPetTourListItem>(
	env: Env,
	operation: string,
	params: URLSearchParams,
	timeoutMs = 8000,
): Promise<KtoPetTourClientResult<TItem>> {
	const serviceKey = env.PUBLIC_DATA_API_KEY?.trim();

	if (!serviceKey) {
		return {
			ok: false,
			status: 500,
			code: "MISSING_PUBLIC_DATA_API_KEY",
			message: "PUBLIC_DATA_API_KEY Secret이 설정되어 있지 않습니다.",
		};
	}

	const requestUrl = buildPublicDataUrl(operation, serviceKey, params);
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const response = await fetch(requestUrl, {
			method: "GET",
			headers: { Accept: "application/json" },
			signal: controller.signal,
		});

		const bodyText = await response.text();

		if (!response.ok) {
			return {
				ok: false,
				status: 502,
				code: "PUBLIC_DATA_HTTP_ERROR",
				message: `공공데이터 API가 HTTP ${response.status}를 반환했습니다.`,
				details: {
					upstreamStatus: response.status,
					bodyPreview: bodyText.slice(0, 500),
				},
			};
		}

		const parsed = parsePublicDataBody<TItem>(bodyText);

		if (!parsed.ok) {
			return parsed;
		}

		const resultCode = normalizeResultCode(
			parsed.data.response?.header?.resultCode,
		);
		const resultMsg = parsed.data.response?.header?.resultMsg ?? "UNKNOWN";

		if (
			resultCode &&
			!NORMAL_RESULT_CODES.has(resultCode) &&
			resultCode !== EMPTY_RESULT_CODE
		) {
			return {
				ok: false,
				status: 502,
				code: `PUBLIC_DATA_RESULT_${resultCode}`,
				message: resultMsg,
			};
		}

		return parsed;
	} catch (error) {
		if (isAbortError(error)) {
			return {
				ok: false,
				status: 504,
				code: "PUBLIC_DATA_TIMEOUT",
				message: `공공데이터 API 요청이 ${timeoutMs}ms 안에 끝나지 않았습니다.`,
			};
		}

		return {
			ok: false,
			status: 502,
			code: "PUBLIC_DATA_FETCH_FAILED",
			message: "공공데이터 API 요청 중 네트워크 오류가 발생했습니다.",
			details: error instanceof Error ? error.message : String(error),
		};
	} finally {
		clearTimeout(timeoutId);
	}
}

function buildPublicDataUrl(
	operation: string,
	serviceKey: string,
	params: URLSearchParams,
) {
	const safeOperation = operation.replace(/^\/+/, "");
	const query = new URLSearchParams(params);

	query.set("MobileOS", "WEB");
	query.set("MobileApp", "GoodThingz");
	query.set("_type", "json");

	const encodedServiceKey = looksUrlEncoded(serviceKey)
		? serviceKey
		: encodeURIComponent(serviceKey);
	const rest = query.toString();

	return `${BASE_URL}/${safeOperation}?serviceKey=${encodedServiceKey}&${rest}`;
}

function parsePublicDataBody<TItem>(
	bodyText: string,
): KtoPetTourClientResult<TItem> {
	try {
		return {
			ok: true,
			data: JSON.parse(bodyText) as PublicDataResponse<TItem>,
		};
	} catch {
		const xmlError = parseXmlError(bodyText);

		if (xmlError.returnReasonCode) {
			const resultCode = xmlError.returnReasonCode;

			if (resultCode === EMPTY_RESULT_CODE) {
				return {
					ok: true,
					data: {
						response: {
							header: {
								resultCode,
								resultMsg:
									xmlError.returnAuthMsg ?? xmlError.errMsg ?? "NODATA_ERROR",
							},
							body: {
								items: { item: [] },
								numOfRows: 0,
								pageNo: 1,
								totalCount: 0,
							},
						},
					},
				};
			}

			return {
				ok: false,
				status: 502,
				code: `PUBLIC_DATA_RESULT_${resultCode}`,
				message: xmlError.returnAuthMsg ?? xmlError.errMsg ?? "SERVICE ERROR",
				details: xmlError,
			};
		}

		return {
			ok: false,
			status: 502,
			code: "PUBLIC_DATA_PARSE_ERROR",
			message: "공공데이터 API 응답을 JSON 또는 XML 오류 형식으로 해석할 수 없습니다.",
			details: bodyText.slice(0, 500),
		};
	}
}

function parseXmlError(xmlText: string): PublicDataXmlError {
	return {
		errMsg: readXmlTag(xmlText, "errMsg"),
		returnAuthMsg: readXmlTag(xmlText, "returnAuthMsg"),
		returnReasonCode: readXmlTag(xmlText, "returnReasonCode"),
	};
}

function readXmlTag(xmlText: string, tagName: string) {
	const match = xmlText.match(new RegExp(`<${tagName}>(.*?)</${tagName}>`, "s"));
	return match?.[1]?.trim();
}

function looksUrlEncoded(value: string) {
	return /%[0-9A-Fa-f]{2}/.test(value);
}

function normalizeResultCode(value: unknown) {
	return value === undefined || value === null ? null : String(value);
}

function isAbortError(error: unknown) {
	return error instanceof DOMException && error.name === "AbortError";
}
