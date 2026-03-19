import { env } from "../lib/env.js";
import { fetch } from "undici";
class LocationService {
    cache = new Map();
    async geocode(locationText) {
        const normalized = locationText.trim().toLowerCase();
        if (!normalized)
            return null;
        if (this.cache.has(normalized)) {
            return this.cache.get(normalized) ?? null;
        }
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), env.GEOCODE_TIMEOUT_MS);
            const params = new URLSearchParams({
                q: locationText,
                format: "json",
                limit: "1",
            });
            const response = await fetch(`${env.GEOCODE_BASE_URL}?${params.toString()}`, {
                signal: controller.signal,
                headers: {
                    "User-Agent": "InVert/1.0 (verification location check)",
                },
            });
            globalThis.clearTimeout(timeout);
            if (!response.ok) {
                this.cache.set(normalized, null);
                return null;
            }
            const rows = (await response.json());
            if (!rows.length) {
                this.cache.set(normalized, null);
                return null;
            }
            const row = rows[0];
            const result = {
                latitude: Number(row.lat),
                longitude: Number(row.lon),
                displayName: row.display_name,
            };
            if (!Number.isFinite(result.latitude) || !Number.isFinite(result.longitude)) {
                this.cache.set(normalized, null);
                return null;
            }
            this.cache.set(normalized, result);
            return result;
        }
        catch {
            this.cache.set(normalized, null);
            return null;
        }
    }
    distanceKm(a, b) {
        const toRad = (deg) => (deg * Math.PI) / 180;
        const earthRadiusKm = 6371;
        const dLat = toRad(b.latitude - a.latitude);
        const dLon = toRad(b.longitude - a.longitude);
        const lat1 = toRad(a.latitude);
        const lat2 = toRad(b.latitude);
        const h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        return 2 * earthRadiusKm * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
    }
}
export const locationService = new LocationService();
