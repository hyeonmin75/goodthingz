import { canonicalUrl, INDEX_PAGES } from "../seo";

export function loader() {
	const urls = INDEX_PAGES.map(({ path, lastModified }) => {
		return [
			"  <url>",
			`    <loc>${escapeXml(canonicalUrl(path))}</loc>`,
			`    <lastmod>${lastModified}</lastmod>`,
			"  </url>",
		].join("\n");
	}).join("\n");
	const body = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		urls,
		"</urlset>",
		"",
	].join("\n");

	return new Response(body, {
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
		},
	});
}

function escapeXml(value: string) {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}
