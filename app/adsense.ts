const ADS_TXT_PLACEHOLDER_PUBLISHER_ID = "pub-0000000000000000";

// Google AdSense에서 받은 값으로 아래 2줄만 교체하세요.
export const ADSENSE_CLIENT_ID: string = "ca-pub-1998974659917167";
export const ADS_TXT_PUBLISHER_ID: string = "pub-1998974659917167";
// Ad serving is paused. Keep verification and ads.txt; see docs/audit/publisher-policy-review.md.

export function getAdsTxtContent() {
	if (ADS_TXT_PUBLISHER_ID === ADS_TXT_PLACEHOLDER_PUBLISHER_ID) {
		return [
			"# Google AdSense ads.txt placeholder",
			"# 아래 줄의 pub-0000000000000000 부분을 실제 AdSense publisher ID로 교체하세요.",
			"# google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0",
			"",
		].join("\n");
	}

	return `google.com, ${ADS_TXT_PUBLISHER_ID}, DIRECT, f08c47fec0942fa0\n`;
}
