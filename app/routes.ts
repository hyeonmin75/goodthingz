import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("pet-travel", "routes/pet-travel.tsx"),
	route(
		"pet-travel/guides/visit-checklist",
		"routes/pet-travel-visit-checklist.tsx",
	),
	route("pet-travel/search", "routes/pet-travel-search.tsx"),
	route("pet-travel/places/:contentId", "routes/pet-travel-place.tsx"),
	route("pet-travel/compare", "routes/pet-travel-compare.tsx"),
	route("data-sources/kto-pet-tour", "routes/data-source-kto-pet-tour.tsx"),
	route("about", "routes/about.tsx"),
	route("privacy", "routes/privacy.tsx"),
	route("ads.txt", "routes/ads.txt.ts"),
	route("robots.txt", "routes/robots.txt.ts"),
	route("sitemap.xml", "routes/sitemap.xml.ts"),
	route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
