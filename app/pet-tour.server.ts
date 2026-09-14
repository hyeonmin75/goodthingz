import type { AppLoadContext } from "react-router";
import { handlePetTourPlacesRequest } from "../workers/api/kto-pet-tour/routes";
import type {
  ApiPayload,
  KtoPetTourPlacesResponse,
} from "../workers/api/kto-pet-tour/types";

// Only anonymous first-page lists are shared; keywords and coordinates are not cached.
export async function loadInitialPlaces(
  context: AppLoadContext,
  keyword = "",
  contentTypeId = "",
) {
  const params = new URLSearchParams({
    page: "1",
    pageSize: "12",
    arrange: "C",
  });
  if (keyword) params.set("keyword", keyword);
  if (contentTypeId) params.set("contentTypeId", contentTypeId);
  const request = new Request(
    `https://goodthingfor.com/api/public-data/pet-tour/places?${params}`,
  );
  const cacheKey = new Request(
    `https://goodthingfor.com/__snapshot/v1?type=${contentTypeId || "all"}`,
  );
  const cache =
    !keyword && typeof caches !== "undefined"
      ? (caches as CacheStorage & { default: Cache }).default
      : null;
  try {
    const cached = await cache?.match(cacheKey);
    if (cached) return (await cached.json()) as KtoPetTourPlacesResponse;
    const response = await handlePetTourPlacesRequest(
      request,
      context.cloudflare.env,
    );
    const payload =
      (await response.json()) as ApiPayload<KtoPetTourPlacesResponse>;
    if (!payload.ok) return null;
    if (cache && !payload.data.empty) {
      const snapshot = Response.json(payload.data, {
        headers: { "Cache-Control": "public, max-age=300" },
      });
      context.cloudflare.ctx.waitUntil(
        cache.put(cacheKey, snapshot).catch(() => undefined),
      );
    }
    return payload.data;
  } catch {
    return null;
  }
}
