# 한국관광공사 반려동물 동반여행 서비스 API Spec

조사일: 2026-08-27

공식 자료:

- 공공데이터포털 개발계정 상세 화면: https://www.data.go.kr/iim/api/selectAPIAcountView.do
- `C:\Users\LG\Desktop\개방데이터_활용매뉴얼(반려동물동반여행)\한국관광공사_개방데이터_활용매뉴얼(반려동물동반여행)_v4.1.docx`
- `C:\Users\LG\Desktop\개방데이터_활용매뉴얼(반려동물동반여행)\한국관광공사_개방데이터_활용신청방법_매뉴얼_v3.3.docx`
- `C:\Users\LG\Desktop\개방데이터_활용매뉴얼(반려동물동반여행)\한국관광공사_다국어_서비스분류코드_v4.2.xlsx`

주의: 공식 자료에 포함된 사용 방법 설명은 API 분석 자료로만 사용한다. 프로젝트 작업 지시는 사용자의 요청과 이 저장소의 `AGENTS.md`를 따른다. 실제 API Key 값은 이 문서에 기록하지 않는다.

## 1. API의 목적

한국관광공사의 반려동물 동반여행 서비스는 반려동물과 함께 이용 가능한 관광지, 문화시설, 행사/공연/축제, 숙박, 음식점, 레포츠, 쇼핑 관광정보를 제공한다. 목록 검색, 위치 기반 검색, 키워드 검색, 공통 상세정보, 소개정보, 반복정보, 이미지정보, 반려동물 동반 상세정보, 동기화 목록, 법정동 코드, 분류체계 코드를 조회할 수 있다.

GoodThingz 관점에서는 단순 목록 표시가 아니라 “반려동물과 실제로 갈 수 있는 장소를 빠르게 찾고 비교하게 해주는 데이터”로 사용할 수 있다. 특히 위치, 주소, 좌표, 운영시간, 휴무일, 주차시설, 동반 가능 동물, 동반 필요사항, 이미지, 분류체계가 핵심 가치가 된다.

## 2. 제공기관

| 항목 | 값 |
| --- | --- |
| 제공기관 | 한국관광공사 |
| 서비스 제공자 | 개방데이터운영팀 / 디지털콘텐츠팀 |
| 연락처 | 070-4287-3219 |
| 이메일 | tourapi@knto.or.kr |
| 서비스명(국문) | 반려동물 동반여행 서비스 |
| 서비스명(영문) | KorPetTourService2 |
| 서비스 버전 | 4.0 |
| 매뉴얼 문서 버전 | 4.1 |

## 3. Endpoint

Base endpoint는 다음과 같다.

```text
https://apis.data.go.kr/B551011/KorPetTourService2
```

매뉴얼 예시는 일부 `http://`를 사용하지만, 개발계정 화면과 서비스 보안 항목에서 HTTPS 전송을 확인했으므로 구현 기본값은 `https://`를 사용한다.

### 매뉴얼 v4.1 기준 endpoint

| 기능 | Path | 전체 URL |
| --- | --- | --- |
| 지역기반 관광정보 조회 | `/areaBasedList2` | `https://apis.data.go.kr/B551011/KorPetTourService2/areaBasedList2` |
| 위치기반 관광정보 조회 | `/locationBasedList2` | `https://apis.data.go.kr/B551011/KorPetTourService2/locationBasedList2` |
| 키워드 검색 조회 | `/searchKeyword2` | `https://apis.data.go.kr/B551011/KorPetTourService2/searchKeyword2` |
| 공통정보 조회 | `/detailCommon2` | `https://apis.data.go.kr/B551011/KorPetTourService2/detailCommon2` |
| 소개정보 조회 | `/detailIntro2` | `https://apis.data.go.kr/B551011/KorPetTourService2/detailIntro2` |
| 반복정보 조회 | `/detailInfo2` | `https://apis.data.go.kr/B551011/KorPetTourService2/detailInfo2` |
| 이미지정보 조회 | `/detailImage2` | `https://apis.data.go.kr/B551011/KorPetTourService2/detailImage2` |
| 반려동물 동반여행 조회 | `/detailPetTour2` | `https://apis.data.go.kr/B551011/KorPetTourService2/detailPetTour2` |
| 반려동물 동반여행 동기화 목록 조회 | `/petTourSyncList2` | `https://apis.data.go.kr/B551011/KorPetTourService2/petTourSyncList2` |
| 법정동 코드 조회 | `/ldongCode2` | `https://apis.data.go.kr/B551011/KorPetTourService2/ldongCode2` |
| 분류체계 코드 조회 | `/lclsSystmCode2` | `https://apis.data.go.kr/B551011/KorPetTourService2/lclsSystmCode2` |

### 공식 자료 간 불일치

공공데이터포털 개발계정 화면에는 `/areaCode2`, `/categoryCode2`도 표시되었다. 그러나 활용매뉴얼 v4.1의 서비스목록에는 두 endpoint가 없고, 개정 이력에는 “지역코드 오퍼레이션 삭제”, “서비스분류코드 오퍼레이션 삭제”가 기록되어 있다. 따라서 구현 기준 endpoint에서는 제외하고, 실제 호출 가능 여부는 나중에 별도 검증 전까지 `UNKNOWN`으로 둔다.

## 4. HTTP method

HTTP method는 `GET`이다. 매뉴얼의 서비스 명세에서 인터페이스 표준이 `REST (GET)`으로 표시되어 있다.

## 5. 인증 방식

인증 방식은 공공데이터포털에서 발급받은 서비스 Key 방식이다. 요청 parameter 이름은 `serviceKey`이고 필수값이다. 매뉴얼은 `serviceKey` 샘플을 “인증키 (URL- Encode)”로 설명하므로, 구현할 때는 공공데이터포털에서 제공하는 Encoding/Decoding 키 중 실제 호출 방식에 맞는 키를 사용해야 한다.

API Key는 브라우저에 노출하지 않는다. GoodThingz에서는 Cloudflare Worker에서만 `PUBLIC_DATA_API_KEY` Secret을 읽어 `serviceKey`로 전달한다.

## 6. 공통 요청 parameter

항목구분은 매뉴얼 기준으로 `1 = 필수`, `0 = 옵션`이다.

| parameter | 국문명 | 필수 | 샘플 | 설명 |
| --- | --- | --- | --- | --- |
| `serviceKey` | 인증키(서비스키) | 예 | 인증키 | 공공데이터포털에서 발급받은 인증키 |
| `MobileOS` | OS 구분 | 예 | `ETC` | `IOS`, `AND`, `WIN` 또는 `WEB`, `ETC`. endpoint 표마다 `WIN`/`WEB` 표기가 다르므로 구현 시 허용값 검증은 보수적으로 처리한다. |
| `MobileApp` | 서비스명 | 예 | `AppTest` 또는 `APP` | 활용 통계를 위한 서비스명. URL 요청 시 반드시 기재해야 한다. GoodThingz에서는 `GoodThingz`를 기본값으로 사용한다. |
| `numOfRows` | 한 페이지 결과 수 | 아니오 | `10` | 한 페이지 결과 수 |
| `pageNo` | 페이지 번호 | 아니오 | `1` | 현재 페이지 번호 |
| `_type` | 응답 메시지 형식 | 아니오 | `json` | 기본 응답은 XML이고, JSON 요청 시 `_type=json`을 추가한다. |

## 7. Endpoint별 필수 parameter

| endpoint | 필수 parameter |
| --- | --- |
| `/areaBasedList2` | `serviceKey`, `MobileOS`, `MobileApp` |
| `/locationBasedList2` | `serviceKey`, `MobileOS`, `MobileApp`, `mapX`, `mapY`, `radius` |
| `/searchKeyword2` | `serviceKey`, `MobileOS`, `MobileApp`, `keyword` |
| `/detailCommon2` | `serviceKey`, `MobileOS`, `MobileApp`, `contentId` |
| `/detailIntro2` | `serviceKey`, `MobileOS`, `MobileApp`, `contentId`, `contentTypeId` |
| `/detailInfo2` | `serviceKey`, `MobileOS`, `MobileApp`, `contentId`, `contentTypeId` |
| `/detailImage2` | `serviceKey`, `MobileOS`, `MobileApp`, `contentId` |
| `/detailPetTour2` | `serviceKey`, `MobileOS`, `MobileApp`, `contentId` |
| `/petTourSyncList2` | `serviceKey`, `MobileOS`, `MobileApp` |
| `/ldongCode2` | `serviceKey`, `MobileOS`, `MobileApp` |
| `/lclsSystmCode2` | `serviceKey`, `MobileOS`, `MobileApp` |

## 8. Endpoint별 선택 parameter

### `/areaBasedList2`

| parameter | 설명 |
| --- | --- |
| `numOfRows` | 한 페이지 결과 수 |
| `pageNo` | 페이지 번호 |
| `_type` | `json` 지정 시 JSON 응답 |
| `arrange` | 정렬 구분. `A=제목순`, `C=수정일순`, `D=생성일순`, 대표이미지 필수 정렬은 `O=제목순`, `Q=수정일순`, `R=생성일순` |
| `contentTypeId` | 관광타입 ID |
| `modifiedtime` | 콘텐츠 수정일, `YYYYMMDD` |
| `lDongRegnCd` | 법정동 시도 코드 |
| `lDongSignguCd` | 법정동 시군구 코드. `lDongRegnCd` 필요 |
| `lclsSystm1` | 분류체계 대분류 |
| `lclsSystm2` | 분류체계 중분류. `lclsSystm1` 필요 |
| `lclsSystm3` | 분류체계 소분류. `lclsSystm1`, `lclsSystm2` 필요 |

### `/locationBasedList2`

| parameter | 필수 | 설명 |
| --- | --- | --- |
| `mapX` | 예 | GPS X좌표, WGS84 경도 |
| `mapY` | 예 | GPS Y좌표, WGS84 위도 |
| `radius` | 예 | 거리 반경, 단위 m, 최대 20000m |
| `arrange` | 아니오 | `A=제목순`, `C=수정일순`, `D=생성일순`, `E=거리순`, 대표이미지 필수 정렬은 `O`, `Q`, `R`, `S` |
| `contentTypeId` | 아니오 | 관광타입 ID |
| `modifiedtime` | 아니오 | 콘텐츠 수정일, `YYYYMMDD` |
| `lDongRegnCd` | 아니오 | 법정동 시도 코드 |
| `lDongSignguCd` | 아니오 | 법정동 시군구 코드. `lDongRegnCd` 필요 |
| `lclsSystm1` | 아니오 | 분류체계 대분류 |
| `lclsSystm2` | 아니오 | 분류체계 중분류. `lclsSystm1` 필요 |
| `lclsSystm3` | 아니오 | 분류체계 소분류. `lclsSystm1`, `lclsSystm2` 필요 |

### `/searchKeyword2`

| parameter | 필수 | 설명 |
| --- | --- | --- |
| `keyword` | 예 | 검색 요청 키워드. 영문을 제외한 문자는 인코딩 필요 |
| `arrange` | 아니오 | `A=제목순`, `C=수정일순`, `D=생성일순`, 대표이미지 필수 정렬은 `O`, `Q`, `R` |
| `lDongRegnCd` | 아니오 | 법정동 시도 코드 |
| `lDongSignguCd` | 아니오 | 법정동 시군구 코드. `lDongRegnCd` 필요 |
| `lclsSystm1` | 아니오 | 분류체계 대분류 |
| `lclsSystm2` | 아니오 | 분류체계 중분류. `lclsSystm1` 필요 |
| `lclsSystm3` | 아니오 | 분류체계 소분류. `lclsSystm1`, `lclsSystm2` 필요 |

매뉴얼 v4.1 개정 이력에 “키워드 검색 오퍼레이션 요청항목 관광타입 삭제”가 있으므로, `searchKeyword2` 구현에는 `contentTypeId`를 기본 parameter로 넣지 않는다.

### 상세 조회 endpoint

| endpoint | 선택 parameter |
| --- | --- |
| `/detailCommon2` | `numOfRows`, `pageNo`, `_type` |
| `/detailIntro2` | `numOfRows`, `pageNo`, `_type` |
| `/detailInfo2` | `numOfRows`, `pageNo`, `_type` |
| `/detailImage2` | `numOfRows`, `pageNo`, `_type`, `imageYN` |
| `/detailPetTour2` | `numOfRows`, `pageNo`, `_type` |

`detailImage2`의 `imageYN`은 `Y=콘텐츠 이미지 조회`, `N=음식점 타입의 음식메뉴 이미지`이다.

### `/petTourSyncList2`

| parameter | 설명 |
| --- | --- |
| `showflag` | 콘텐츠 표출 여부. `1=표출`, `0=비표출` |
| `modifiedtime` | 콘텐츠 변경일자. 수정년도, 수정년월, 수정년월일 입력 가능 |
| `arrange` | `A=제목순`, `C=수정일순`, `D=생성일순`, 대표이미지 필수 정렬은 `O`, `Q`, `R` |
| `contentTypeId` | 관광타입 ID |
| `lDongRegnCd` | 법정동 시도 코드 |
| `lDongSignguCd` | 법정동 시군구 코드. `lDongRegnCd` 필요 |
| `lclsSystm1` | 분류체계 대분류 |
| `lclsSystm2` | 분류체계 중분류. `lclsSystm1` 필요 |
| `lclsSystm3` | 분류체계 소분류. `lclsSystm1`, `lclsSystm2` 필요 |

### `/ldongCode2`

| parameter | 설명 |
| --- | --- |
| `lDongRegnCd` | 법정동 시도 코드. 없으면 전체 시도 목록 호출 |
| `lDongListYn` | 법정동 목록조회 여부. `N=코드조회`, `Y=전체목록조회` |

### `/lclsSystmCode2`

| parameter | 설명 |
| --- | --- |
| `lclsSystm1` | 대분류 코드 |
| `lclsSystm2` | 중분류 코드. `lclsSystm1` 필요 |
| `lclsSystm3` | 소분류 코드. `lclsSystm1`, `lclsSystm2` 필요 |
| `lclsSystmListYn` | 분류체계 목록조회 여부. `N=코드조회`, `Y=전체목록조회` |

## 9. Pagination

목록형 응답은 pagination을 지원한다.

| parameter 또는 field | 위치 | 설명 |
| --- | --- | --- |
| `numOfRows` | 요청/응답 | 한 페이지 결과 수 |
| `pageNo` | 요청/응답 | 현재 페이지 번호 |
| `totalCount` | 응답 | 전체 결과 수 |

`numOfRows` 최대값은 공식 매뉴얼에서 확인되지 않아 `UNKNOWN`이다. 기본 샘플은 대부분 `10`이다.

## 10. JSON/XML 여부

기본 응답은 XML이다. JSON 응답이 필요하면 요청 query에 `_type=json`을 추가한다. GoodThingz 구현에서는 Worker Adapter가 `_type=json`을 기본으로 붙여 JSON을 받고, UI에는 정규화한 데이터만 전달한다.

공공데이터포털에서 출력되는 일부 오류 메시지는 XML로만 출력된다. 따라서 Adapter는 JSON 파싱 실패 시 XML 오류 응답도 처리해야 한다.

## 11. 응답 데이터 구조

JSON 정상 응답 구조는 다음 형태로 확인된다.

```json
{
  "response": {
    "header": {
      "resultCode": "0000",
      "resultMsg": "OK"
    },
    "body": {
      "items": {
        "item": []
      },
      "numOfRows": 10,
      "pageNo": 1,
      "totalCount": 65
    }
  }
}
```

오류 응답은 공공데이터포털 XML 오류 형식을 사용할 수 있다.

```xml
<OpenAPI_ServiceResponse>
  <cmmMsgHeader>
    <errMsg>SERVICE ERROR</errMsg>
    <returnAuthMsg>SERVICE_KEY_IS_NOT_REGISTERED_ERROR</returnAuthMsg>
    <returnReasonCode>30</returnReasonCode>
  </cmmMsgHeader>
</OpenAPI_ServiceResponse>
```

## 12. 주요 field

### 공통 목록 field

`areaBasedList2`, `locationBasedList2`, `searchKeyword2`, `petTourSyncList2`에서 공통적으로 중요한 field는 다음과 같다.

| field | 의미 | 필수 | 비고 |
| --- | --- | --- | --- |
| `contentid` | 콘텐츠 ID | 예 | 상세 조회 연결 key |
| `contenttypeid` | 콘텐츠 타입 ID | 예 | 관광지, 문화시설, 숙박 등 타입 |
| `title` | 제목 | 예 | UI 표시명 |
| `addr1` | 주소 | 아니오 | 기본 주소 |
| `addr2` | 상세주소 | 아니오 | 상세 주소 |
| `zipcode` | 우편번호 | 아니오 | 위치 보조 정보 |
| `tel` | 전화번호 | 아니오 | 연락처 |
| `mapx` | WGS84 경도 | 아니오 | 지도 표시 |
| `mapy` | WGS84 위도 | 아니오 | 지도 표시 |
| `mlevel` | Map Level | 아니오 | 지도 확대 수준 |
| `firstimage` | 대표이미지 원본 URL | 아니오 | 약 500x333 |
| `firstimage2` | 대표이미지 썸네일 URL | 아니오 | 약 150x100 또는 160x100 |
| `cpyrhtDivCd` | 저작권 유형 | 아니오 | `Type1`, `Type3` |
| `createdtime` | 등록일 | 예 | `YYYYMMDDHHmmss` 형태 |
| `modifiedtime` | 수정일 | 예 | `YYYYMMDDHHmmss` 형태 |
| `lDongRegnCd` | 법정동 시도 코드 | 아니오 | 법정동 코드 조회와 연결 |
| `lDongSignguCd` | 법정동 시군구 코드 | 아니오 | 법정동 코드 조회와 연결 |
| `lclsSystm1` | 분류체계 대분류 | 아니오 | 분류체계 코드 조회와 연결 |
| `lclsSystm2` | 분류체계 중분류 | 아니오 | 분류체계 코드 조회와 연결 |
| `lclsSystm3` | 분류체계 소분류 | 아니오 | 분류체계 코드 조회와 연결 |
| `dist` | 중심 좌표로부터 거리 | 위치기반 응답에서 예 | 단위 m |
| `showflag` | 콘텐츠 표출 여부 | 동기화 응답에서 예 | `1=표출`, `0=비표출` |

### 공통 상세 field

`detailCommon2`는 목록 field에 더해 다음 field를 제공한다.

| field | 의미 |
| --- | --- |
| `homepage` | 홈페이지 주소 |
| `telname` | 전화번호명 |
| `overview` | 콘텐츠 개요 |

### 소개정보 field

`detailIntro2`는 `contentTypeId`별로 응답 field가 다르다. 공통 기본 field는 `contentid`, `contenttypeid`이고, 타입별 대표 field는 다음과 같다.

| contentTypeId | 타입 | 대표 field |
| --- | --- | --- |
| `12` | 관광지 | `accomcount`, `chkbabycarriage`, `chkcreditcard`, `chkpet`, `expagerange`, `expguide`, `heritage1`, `heritage2`, `heritage3`, `infocenter`, `opendate`, `parking`, `restdate`, `useseason`, `usetime` |
| `14` | 문화시설 | `accomcountculture`, `chkbabycarriageculture`, `chkcreditcardculture`, `chkpetculture`, `discountinfo`, `infocenterculture`, `parkingculture`, `parkingfee`, `restdateculture`, `usefee`, `usetimeculture`, `scale`, `spendtime` |
| `15` | 행사/공연/축제 | `agelimit`, `bookingplace`, `discountinfofestival`, `eventenddate`, `eventhomepage`, `eventplace`, `eventstartdate`, `festivalgrade`, `festivaltype`, `placeinfo`, `playtime`, `program`, `progresstype`, `spendtimefestival`, `sponsor1`, `sponsor1tel`, `sponsor2`, `sponsor2tel`, `subevent`, `usetimefestival` |
| `28` | 레포츠 | `accomcountleports`, `chkbabycarriageleports`, `chkcreditcardleports`, `chkpetleports`, `expagerangeleports`, `infocenterleports`, `openperiod`, `parkingfeeleports`, `parkingleports`, `reservation`, `restdateleports`, `scaleleports`, `usefeeleports`, `usetimeleports` |
| `32` | 숙박 | `accomcountlodging`, `checkintime`, `checkouttime`, `chkcooking`, `foodplace`, `infocenterlodging`, `parkinglodging`, `pickup`, `roomcount`, `reservationlodging`, `reservationurl`, `roomtype`, `scalelodging`, `subfacility`, `barbecue`, `beauty`, `beverage`, `bicycle`, `campfire`, `fitness`, `karaoke`, `publicbath`, `publicpc`, `sauna`, `seminar`, `sports`, `refundregulation` |
| `38` | 쇼핑 | `chkbabycarriageshopping`, `chkcreditcardshopping`, `chkpetshopping`, `culturecenter`, `fairday`, `infocentershopping`, `opendateshopping`, `opentime`, `parkingshopping`, `restdateshopping`, `restroom`, `saleitem`, `saleitemcost`, `scaleshopping`, `shopguide` |
| `39` | 음식점 | `chkcreditcardfood`, `discountinfofood`, `firstmenu`, `infocenterfood`, `kidsfacility`, `opendatefood`, `opentimefood`, `packing`, `parkingfood`, `reservationfood`, `restdatefood`, `scalefood`, `seat`, `smoking`, `treatmenu`, `lcnsno` |

매뉴얼 추출 원문에는 `chkcreditcard shopping`처럼 공백이 들어간 표기가 있으나, field 이름으로는 `chkcreditcardshopping`을 사용해야 한다고 보는 것이 합리적이다. 실제 샘플 응답 검증 전까지 이 항목은 주의한다.

### 반복정보 field

`detailInfo2`는 숙박을 제외한 타입에서 반복 항목을 제공한다.

| field | 의미 |
| --- | --- |
| `contentid` | 콘텐츠 ID |
| `contenttypeid` | 콘텐츠 타입 ID |
| `fldgubun` | 일련번호 |
| `infoname` | 제목 |
| `infotext` | 내용 |
| `serialnum` | 반복 일련번호 |

매뉴얼의 반복정보 유형 예시는 관광지, 문화시설, 행사/공연/축제, 레포츠, 쇼핑 중심으로 제공되어 있다. 숙박 객실 정보 field는 현재 추출된 표에서 확인되지 않아 `UNKNOWN`이다.

### 이미지정보 field

| field | 의미 |
| --- | --- |
| `contentid` | 콘텐츠 ID |
| `imgname` | 이미지명 |
| `originimgurl` | 원본 이미지 URL |
| `smallimageurl` | 썸네일 이미지 URL |
| `serialnum` | 이미지 일련번호 |
| `cpyrhtDivCd` | 저작권 유형 |

### 반려동물 동반여행 field

`detailPetTour2`는 GoodThingz에서 가장 중요한 반려동물 조건 field를 제공한다.

| field | 의미 |
| --- | --- |
| `contentid` | 콘텐츠 ID |
| `relaAcdntRiskMtr` | 관련 사고 대비사항 |
| `acmpyTypeCd` | 동반유형코드 또는 동반구분 |
| `relaPosesFclty` | 관련 구비 시설 |
| `relaFrnshPrdlst` | 관련 비치 품목 |
| `etcAcmpyInfo` | 기타 동반 정보 |
| `relaPurcPrdlst` | 관련 구매 품목 |
| `acmpyPsblCpam` | 동반가능동물 |
| `relaRntlPrdlst` | 관련 렌탈 품목 |
| `acmpyNeedMtr` | 동반 시 필요사항 |

### 법정동 코드 field

`ldongCode2`는 `lDongListYn` 값에 따라 응답 field가 달라진다.

| field | 의미 |
| --- | --- |
| `code` | 시도코드 또는 시군구코드. `lDongListYn=N`일 때 표출 |
| `name` | 시도명 또는 시군구명. `lDongListYn=N`일 때 표출 |
| `rnum` | 일련번호 |
| `lDongRegnCd` | 법정동 시도코드. `lDongListYn=Y`일 때 표출 |
| `lDongRegnNm` | 법정동 시도명. `lDongListYn=Y`일 때 표출 |
| `lDongSignguCd` | 법정동 시군구코드. `lDongListYn=Y`일 때 표출 |
| `lDongSignguNm` | 법정동 시군구명. `lDongListYn=Y`일 때 표출 |

### 분류체계 코드 field

`lclsSystmCode2`는 `lclsSystmListYn` 값에 따라 응답 field가 달라진다.

| field | 의미 |
| --- | --- |
| `code` | 1Depth, 2Depth, 3Depth 코드. `lclsSystmListYn=N`일 때 표출 |
| `name` | 1Depth, 2Depth, 3Depth 코드명. `lclsSystmListYn=N`일 때 표출 |
| `rnum` | 일련번호 |
| `lclsSystm1Cd` | 분류체계 대분류코드. `lclsSystmListYn=Y`일 때 표출 |
| `lclsSystm1Nm` | 분류체계 대분류명. `lclsSystmListYn=Y`일 때 표출 |
| `lclsSystm2Cd` | 분류체계 중분류코드. `lclsSystmListYn=Y`일 때 표출 |
| `lclsSystm2Nm` | 분류체계 중분류명. `lclsSystmListYn=Y`일 때 표출 |
| `lclsSystm3Cd` | 분류체계 소분류코드. `lclsSystmListYn=Y`일 때 표출 |
| `lclsSystm3Nm` | 분류체계 소분류명. `lclsSystmListYn=Y`일 때 표출 |

## 13. 코드표

### 콘텐츠 타입 코드

매뉴얼의 국문 반려동물 동반여행 콘텐츠 타입 코드는 다음과 같다.

| contentTypeId | 타입 |
| --- | --- |
| `12` | 관광지 |
| `14` | 문화시설 |
| `15` | 행사/공연/축제 |
| `28` | 레포츠 |
| `32` | 숙박 |
| `38` | 쇼핑 |
| `39` | 음식점 |

일부 요청 parameter 설명에는 `75`, `76`, `77`, `78`, `79`, `80`, `82`, `85` 코드가 함께 나타난다. 이는 다국어 서비스분류코드 문서의 contenttypeid와 맞물리는 값이며, 반려동물 동반여행 국문 서비스 구현 기준으로는 위의 `12`, `14`, `15`, `28`, `32`, `38`, `39`를 우선 사용한다. 실제 API 호출 테스트 전까지 혼재된 코드 설명은 주의한다.

### 저작권 유형

| code | 의미 |
| --- | --- |
| `Type1` | 제1유형, 출처표시 권장 |
| `Type3` | 제3유형, 제1유형 + 변경금지 |

## 14. 오류코드

공공데이터포털에서 출력되는 오류 메시지는 XML로만 출력될 수 있다. 매뉴얼에 제시된 오류코드는 다음과 같다.

| 코드 | 메시지 | 설명 |
| --- | --- | --- |
| `00` | `NORMAL_CODE` | 정상 |
| `01` | `APPLICATION_ERROR` | 어플리케이션 에러 |
| `02` | `DB_ERROR` | 데이터베이스 에러 |
| `03` | `NODATA_ERROR` | 데이터 없음 에러 |
| `04` | `HTTP_ERROR` | HTTP 에러 |
| `05` | `SERVICETIMEOUT_ERROR` | 서비스 연결 실패 에러 |
| `10` | `INVALID_REQUEST_PARAMETER_ERROR` | 잘못된 요청 parameter |
| `11` | `NO_MANDATORY_REQUEST_PARAMETERS_ERROR` | 필수 요청 parameter 없음 |
| `12` | `NO_OPENAPI_SERVICE_ERROR` | 해당 OpenAPI 서비스가 없거나 폐기됨 |
| `20` | `SERVICE_ACCESS_DENIED_ERROR` | 서비스 접근 거부 |
| `21` | `TEMPORARILY_DISABLE_THE_SERVICEKEY_ERROR` | 일시적으로 사용할 수 없는 서비스 Key |
| `22` | `LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR` | 서비스 요청 제한 횟수 초과 |
| `30` | `SERVICE_KEY_IS_NOT_REGISTERED_ERROR` | 등록되지 않은 서비스 Key |
| `31` | `DEADLINE_HAS_EXPIRED_ERROR` | 활용기간 만료 |
| `32` | `UNREGISTERED_IP_ERROR` | 등록되지 않은 IP |
| `33` | `UNSIGNED_CALL_ERROR` | 서명되지 않은 호출 |
| `99` | `UNKNOWN_ERROR` | 기타 에러 |

정상 JSON 샘플의 `resultCode`는 `0000`으로 표시된다. 오류코드표의 정상 코드 `00`과 샘플 정상 코드 `0000`이 함께 존재하므로 Adapter에서는 둘을 모두 정상 후보로 고려하되, 실제 호출 결과 기준으로 확정한다.

## 15. 데이터 갱신 기준

데이터 갱신주기는 `일 1회`이다. 매뉴얼 v4.1 개정일은 `2026-02-25`이며, 목록 오퍼레이션에 법정동과 분류체계 요청/응답 항목이 추가되었다.

## 16. 이용 제한

| 항목 | 값 |
| --- | --- |
| 개발계정 트래픽 | 각 오퍼레이션별 일 1,000건 |
| 개발계정 승인 | 자동승인 |
| 개발계정 사용 가능 시점 | 활용 신청 후 약 10분 또는 10~30분 이후 |
| 운영계정 승인 | 한국관광공사 담당자 승인 필요 |
| 운영계정 승인 소요 | 약 1~3일 |
| 운영계정 활용기간 | 승인일로부터 24개월 |
| 현재 개발계정 활용기간 | 2026-01-09 ~ 2026-10-29 |
| 사용 제약 사항 | 매뉴얼 서비스 명세상 N/A |
| 이용허락범위 | 제한 없음 |

초당 호출 제한, 최대 `numOfRows`, 장애 시 제한 정책은 공식 자료에서 확인되지 않아 `UNKNOWN`이다.

## 17. 실제 웹서비스에서 사용할 수 있는 데이터

GoodThingz에서 실제 사용자 가치로 연결할 수 있는 데이터는 다음과 같다.

- 위치 기반 주변 반려동물 동반 가능 장소 검색: `locationBasedList2`, `mapx`, `mapy`, `dist`, `radius`
- 지역 기반 여행지 검색: `areaBasedList2`, `lDongRegnCd`, `lDongSignguCd`, `addr1`, `addr2`
- 키워드 검색: `searchKeyword2`, `keyword`, `title`
- 장소 기본 비교: `title`, `addr1`, `tel`, `firstimage`, `contenttypeid`, `modifiedtime`
- 상세 판단 정보: `detailCommon2`의 `homepage`, `overview`
- 방문 가능성 판단: `detailIntro2`의 `restdate`, `usetime`, `parking`, 타입별 운영/예약/요금 field
- 반려동물 조건 판단: `detailPetTour2`의 `acmpyTypeCd`, `acmpyPsblCpam`, `acmpyNeedMtr`, `etcAcmpyInfo`
- 이미지 품질 보강: `detailImage2`의 `originimgurl`, `smallimageurl`, `cpyrhtDivCd`
- 데이터 동기화 및 노출 관리: `petTourSyncList2`의 `showflag`, `modifiedtime`
- 지역/분류 필터명 매핑: `ldongCode2`, `lclsSystmCode2`

GoodThingz의 초기 서비스 가치는 “반려동물과 갈 수 있는 장소를 지도/지역/키워드로 찾고, 동반 조건·운영시간·주차·이미지를 함께 비교하게 하는 것”으로 잡는 것이 적합하다. API 원본 field를 UI에 직접 노출하지 말고, 예를 들어 `acmpyPsblCpam`은 `allowedPetDescription`, `acmpyNeedMtr`은 `requiredPetItems`, `etcAcmpyInfo`는 `petPolicyNotes`처럼 정규화한 뒤 UI에 전달한다.

## 18. 부족한 데이터

현재 공식 자료를 읽고도 부족한 데이터는 다음과 같다.

- `numOfRows` 최대값
- 실제 API 호출 시 Encoding Key와 Decoding Key 중 어떤 값이 이 프로젝트 환경에서 안정적인지
- `/areaCode2`, `/categoryCode2`의 실제 호출 가능 여부
- 숙박 객실 반복정보의 구체 field
- 모든 endpoint의 실제 null/빈 문자열 패턴
- `contentTypeId` 설명에 혼재된 국문 코드와 다국어 코드의 최종 적용 기준
- 오류 응답이 항상 XML인지, `_type=json` 요청 시에도 일부 오류가 XML인지에 대한 실제 사례
- 이미지 URL의 HTTP/HTTPS 혼재 여부와 브라우저 표시 안정성
- 운영계정 전환 후 실제 트래픽 제한

## 19. 구현 전 원칙

아직 코드와 UI를 만들지 않는다. 구현할 때는 Cloudflare Worker에서만 외부 API를 호출하고, `PUBLIC_DATA_API_KEY` Secret을 `serviceKey` parameter로 전달한다. API별 Adapter를 만들고, 원본 field는 Worker 또는 서버 레이어에서 정규화한 뒤 UI에 전달한다.

추천 Adapter 우선순위는 `locationBasedList2`, `areaBasedList2`, `searchKeyword2`, `detailCommon2`, `detailPetTour2`, `detailIntro2`, `detailImage2` 순서다. 이 순서는 사용자의 검색 시간, 비교 시간, 판단 시간을 줄이는 데 직접 연결되는 기능을 먼저 검증하기 위한 것이다.
