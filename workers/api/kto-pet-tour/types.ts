export type PublicDataResultCode =
	| "00"
	| "0000"
	| "01"
	| "02"
	| "03"
	| "04"
	| "05"
	| "10"
	| "11"
	| "12"
	| "20"
	| "21"
	| "22"
	| "30"
	| "31"
	| "32"
	| "33"
	| "99"
	| string;

export interface PublicDataHeader {
	resultCode?: PublicDataResultCode | number;
	resultMsg?: string;
}

export interface PublicDataBody<TItem> {
	items?: {
		item?: TItem | TItem[] | "";
	};
	numOfRows?: number | string;
	pageNo?: number | string;
	totalCount?: number | string;
}

export interface PublicDataResponse<TItem> {
	response?: {
		header?: PublicDataHeader;
		body?: PublicDataBody<TItem>;
	};
}

export interface PublicDataXmlError {
	errMsg?: string;
	returnAuthMsg?: string;
	returnReasonCode?: string;
}

export interface RawKtoPetTourListItem {
	contentid?: string | number;
	contenttypeid?: string | number;
	title?: string;
	addr1?: string;
	addr2?: string;
	zipcode?: string | number;
	tel?: string;
	mapx?: string | number;
	mapy?: string | number;
	mlevel?: string | number;
	firstimage?: string;
	firstimage2?: string;
	cpyrhtDivCd?: string;
	createdtime?: string | number;
	modifiedtime?: string | number;
	lDongRegnCd?: string | number;
	lDongSignguCd?: string | number;
	lclsSystm1?: string;
	lclsSystm2?: string;
	lclsSystm3?: string;
	dist?: string | number;
	showflag?: string | number;
}

export interface RawKtoPetTourCommonDetailItem extends RawKtoPetTourListItem {
	homepage?: string;
	telname?: string;
	overview?: string;
}

export interface RawKtoPetTourIntroDetailItem {
	contentid?: string | number;
	contenttypeid?: string | number;
	accomcount?: string;
	accomcountculture?: string;
	accomcountleports?: string;
	accomcountlodging?: string;
	agelimit?: string;
	bookingplace?: string;
	checkintime?: string;
	checkouttime?: string;
	chkbabycarriage?: string;
	chkbabycarriageculture?: string;
	chkbabycarriageleports?: string;
	chkbabycarriageshopping?: string;
	chkcreditcard?: string;
	chkcreditcardculture?: string;
	chkcreditcardfood?: string;
	chkcreditcardleports?: string;
	chkcreditcardshopping?: string;
	chkcooking?: string;
	chkpet?: string;
	chkpetculture?: string;
	chkpetfood?: string;
	chkpetleports?: string;
	chkpetshopping?: string;
	discountinfo?: string;
	discountinfofestival?: string;
	discountinfofood?: string;
	eventenddate?: string | number;
	eventhomepage?: string;
	eventplace?: string;
	eventstartdate?: string | number;
	expagerange?: string;
	expagerangeleports?: string;
	fairday?: string;
	firstmenu?: string;
	foodplace?: string;
	infocenter?: string;
	infocenterculture?: string;
	infocenterfood?: string;
	infocenterleports?: string;
	infocenterlodging?: string;
	infocentershopping?: string;
	kidsfacility?: string;
	opendate?: string;
	opendatefood?: string;
	opendateshopping?: string;
	openperiod?: string;
	opentime?: string;
	opentimefood?: string;
	parking?: string;
	parkingculture?: string;
	parkingfee?: string;
	parkingfood?: string;
	parkingfeeleports?: string;
	parkingleports?: string;
	parkinglodging?: string;
	parkingshopping?: string;
	packing?: string;
	pickup?: string;
	playtime?: string;
	program?: string;
	reservation?: string;
	reservationfood?: string;
	reservationlodging?: string;
	reservationurl?: string;
	restdate?: string;
	restdateculture?: string;
	restdatefood?: string;
	restdateleports?: string;
	restdateshopping?: string;
	roomcount?: string | number;
	roomtype?: string;
	saleitem?: string;
	saleitemcost?: string;
	scale?: string;
	scalefood?: string;
	scaleleports?: string;
	scalelodging?: string;
	scaleshopping?: string;
	seat?: string;
	shopguide?: string;
	spendtime?: string;
	spendtimefestival?: string;
	subevent?: string;
	subfacility?: string;
	treatmenu?: string;
	usefee?: string;
	usefeeleports?: string;
	useseason?: string;
	usetime?: string;
	usetimeculture?: string;
	usetimefestival?: string;
	usetimeleports?: string;
}

export interface RawKtoPetTourPetDetailItem {
	contentid?: string | number;
	relaAcdntRiskMtr?: string;
	acmpyTypeCd?: string;
	relaPosesFclty?: string;
	relaFrnshPrdlst?: string;
	etcAcmpyInfo?: string;
	relaPurcPrdlst?: string;
	acmpyPsblCpam?: string;
	relaRntlPrdlst?: string;
	acmpyNeedMtr?: string;
}

export interface RawKtoPetTourImageItem {
	contentid?: string | number;
	imgname?: string;
	originimgurl?: string;
	smallimageurl?: string;
	serialnum?: string | number;
	cpyrhtDivCd?: string;
}

export interface KtoPetTourPlaceSummary {
	id: string;
	contentTypeId: string;
	contentTypeName: string;
	title: string;
	address: {
		full: string | null;
		line1: string | null;
		line2: string | null;
		zipcode: string | null;
	};
	contact: {
		tel: string | null;
		hasTel: boolean;
	};
	location: {
		longitude: number | null;
		latitude: number | null;
		mapLevel: number | null;
		distanceMeters: number | null;
	};
	media: {
		primaryImageUrl: string | null;
		thumbnailImageUrl: string | null;
		copyrightType: string | null;
		hasImage: boolean;
	};
	codes: {
		regionCode: string | null;
		districtCode: string | null;
		classification1: string | null;
		classification2: string | null;
		classification3: string | null;
	};
	dates: {
		createdAtRaw: string | null;
		modifiedAtRaw: string | null;
	};
	source: {
		contentId: string;
	};
}

export interface KtoPetTourPlaceDetail {
	id: string;
	title: string | null;
	homepageUrl: string | null;
	overview: string | null;
	contact: {
		tel: string | null;
		telName: string | null;
		infoCenter: string | null;
	};
	address: KtoPetTourPlaceSummary["address"];
	location: KtoPetTourPlaceSummary["location"];
	visitInfo: {
		hours: string | null;
		closedDays: string | null;
		parking: string | null;
		reservation: string | null;
		fee: string | null;
		checkInOut: string | null;
		eventPeriod: string | null;
		mainMenu: string | null;
		additionalNotes: string[];
	};
	petPolicy: {
		hasPetPolicy: boolean;
		companionshipType: string | null;
		allowedPets: string | null;
		requiredItems: string | null;
		policyNotes: string | null;
		facilities: string | null;
		providedItems: string | null;
		purchasableItems: string | null;
		rentalItems: string | null;
		riskNotes: string | null;
	};
	images: Array<{
		name: string | null;
		originImageUrl: string | null;
		thumbnailImageUrl: string | null;
		copyrightType: string | null;
	}>;
	source: {
		provider: "한국관광공사";
		service: "반려동물 동반여행 서비스";
		operations: Array<
			"detailCommon2" | "detailIntro2" | "detailPetTour2" | "detailImage2"
		>;
		dataUpdated: "일 1회";
		retrievedAt: string;
	};
	warnings: string[];
}

export interface KtoPetTourPagination {
	page: number;
	pageSize: number;
	totalCount: number;
	hasNextPage: boolean;
}

export interface KtoPetTourPlacesResponse {
	items: KtoPetTourPlaceSummary[];
	pagination: KtoPetTourPagination;
	empty: boolean;
	source: {
		provider: "한국관광공사";
		service: "반려동물 동반여행 서비스";
		operation: "areaBasedList2" | "searchKeyword2" | "locationBasedList2";
		dataUpdated: "일 1회";
		retrievedAt: string;
	};
	warnings: string[];
}

export interface ApiErrorPayload {
	ok: false;
	error: {
		code: string;
		message: string;
		details?: unknown;
	};
}

export interface ApiSuccessPayload<TData> {
	ok: true;
	data: TData;
}

export type ApiPayload<TData> = ApiSuccessPayload<TData> | ApiErrorPayload;
