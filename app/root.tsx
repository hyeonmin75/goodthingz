import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import { ADSENSE_SCRIPT_SRC } from "./adsense";
import "./app.css";

export const links: Route.LinksFunction = () => [
	{
		rel: "preconnect",
		href: "https://cdn.jsdelivr.net",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://cdn.jsdelivr.net/gh/fonts-archive/GmarketSans/GmarketSans.css",
		crossOrigin: "anonymous",
	},
];

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="ko-KR">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
				<script
					async
					src={ADSENSE_SCRIPT_SRC}
					crossOrigin="anonymous"
				></script>
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "문제가 발생했습니다";
	let details = "요청한 화면을 불러오지 못했습니다.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error";
		details =
			error.status === 404
				? "요청한 페이지를 찾을 수 없습니다."
				: error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="mx-auto max-w-3xl px-6 py-16">
			<h1>{message}</h1>
			<p>{details}</p>
			{stack && (
				<pre className="w-full p-4 overflow-x-auto">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}
