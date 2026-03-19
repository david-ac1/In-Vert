import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import * as exifr from "exifr";
import { locationService } from "./location.service.js";
class PhotoAnalysisService {
    stockHostIndicators = [
        "shutterstock",
        "gettyimages",
        "istockphoto",
        "adobestock",
        "depositphotos",
        "pexels",
        "unsplash",
        "pixabay",
        "freepik",
    ];
    async analyze(photoUrl, locationText) {
        const localPath = this.resolveLocalUploadPath(photoUrl);
        const sourceKind = localPath ? "uploaded_file" : this.inferSourceKind(photoUrl);
        let imageHash = null;
        let exifLatitude = null;
        let exifLongitude = null;
        let exifCapturedAt = null;
        if (localPath) {
            try {
                const buffer = await fs.readFile(localPath);
                imageHash = createHash("sha256").update(buffer).digest("hex");
                const gps = await exifr.gps(localPath).catch(() => null);
                if (gps && Number.isFinite(gps.latitude) && Number.isFinite(gps.longitude)) {
                    exifLatitude = Number(gps.latitude);
                    exifLongitude = Number(gps.longitude);
                }
                const exif = (await exifr.parse(localPath).catch(() => null));
                if (exif?.DateTimeOriginal instanceof Date) {
                    exifCapturedAt = exif.DateTimeOriginal.toISOString();
                }
            }
            catch {
                // Keep null fields if reading/parsing fails.
            }
        }
        if (!imageHash) {
            imageHash = createHash("sha256").update(photoUrl.trim().toLowerCase()).digest("hex");
        }
        const { score: stockRiskScore, signals: stockSignals } = this.computeStockRisk(photoUrl);
        let claimed = null;
        let locationDistanceKm = null;
        if (locationText.trim()) {
            claimed = await locationService.geocode(locationText.trim());
            if (claimed && exifLatitude !== null && exifLongitude !== null) {
                locationDistanceKm = locationService.distanceKm({ latitude: exifLatitude, longitude: exifLongitude }, { latitude: claimed.latitude, longitude: claimed.longitude });
            }
        }
        return {
            sourceKind,
            imageHash,
            stockRiskScore,
            stockSignals,
            exifLatitude,
            exifLongitude,
            exifCapturedAt,
            claimedLatitude: claimed?.latitude ?? null,
            claimedLongitude: claimed?.longitude ?? null,
            locationDistanceKm,
        };
    }
    inferSourceKind(photoUrl) {
        if (!photoUrl.trim())
            return "unknown";
        if (photoUrl.startsWith("http://") || photoUrl.startsWith("https://")) {
            return "external_url";
        }
        return "unknown";
    }
    computeStockRisk(photoUrl) {
        const signals = [];
        let score = 0;
        const normalized = photoUrl.trim().toLowerCase();
        try {
            const url = new URL(normalized);
            const host = url.hostname;
            if (this.stockHostIndicators.some((indicator) => host.includes(indicator))) {
                score += 85;
                signals.push(`stock_host:${host}`);
            }
            const pathName = url.pathname.toLowerCase();
            if (pathName.includes("/stock") || pathName.includes("/royalty-free")) {
                score += 20;
                signals.push("stock_path_pattern");
            }
            if (pathName.includes("shutterstock") ||
                pathName.includes("getty") ||
                pathName.includes("istock")) {
                score += 30;
                signals.push("stock_brand_in_filename");
            }
        }
        catch {
            // non-url inputs are ignored in stock-domain checks.
        }
        return { score: Math.min(100, score), signals };
    }
    resolveLocalUploadPath(photoUrl) {
        if (!photoUrl.trim())
            return null;
        let pathname = "";
        try {
            const parsed = new URL(photoUrl);
            pathname = parsed.pathname;
        }
        catch {
            pathname = photoUrl;
        }
        const marker = "/uploads/";
        const index = pathname.toLowerCase().indexOf(marker);
        if (index === -1)
            return null;
        const fileName = pathname.slice(index + marker.length);
        if (!fileName)
            return null;
        const candidates = [
            path.resolve(process.cwd(), "uploads", fileName),
            path.resolve(process.cwd(), "server", "uploads", fileName),
        ];
        for (const candidate of candidates) {
            if (this.fileExistsSync(candidate)) {
                return candidate;
            }
        }
        return null;
    }
    fileExistsSync(filePath) {
        try {
            return existsSync(filePath);
        }
        catch {
            return false;
        }
    }
}
export const photoAnalysisService = new PhotoAnalysisService();
