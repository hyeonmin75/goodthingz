import { getAdsTxtContent } from "../adsense";

export function loader() {
	return new Response(getAdsTxtContent(), {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
		},
	});
}
