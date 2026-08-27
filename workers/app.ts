import { createRequestHandler } from "react-router";
import {
	handlePetTourPlaceDetailRequest,
	handlePetTourPlacesRequest,
} from "./api/kto-pet-tour/routes";

declare module "react-router" {
	export interface AppLoadContext {
		cloudflare: {
			env: Env;
			ctx: ExecutionContext;
		};
	}
}

const requestHandler = createRequestHandler(
	() => import("virtual:react-router/server-build"),
	import.meta.env.MODE,
);

export default {
	fetch(request, env, ctx) {
		const url = new URL(request.url);

		if (url.pathname === "/api/public-data/pet-tour/places") {
			return handlePetTourPlacesRequest(request, env);
		}

		if (url.pathname === "/api/public-data/pet-tour/place") {
			return handlePetTourPlaceDetailRequest(request, env);
		}

		return requestHandler(request, {
			cloudflare: { env, ctx },
		});
	},
} satisfies ExportedHandler<Env>;
