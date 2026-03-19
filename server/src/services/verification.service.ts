import { env } from "../lib/env.js";
import { actionsRepository } from "../repositories/actions.repository.js";
import type { ActionMediaSignalsRecord, ActionRecord } from "../types/domain.js";
import { photoAnalysisService } from "./photo-analysis.service.js";

type CheckResult = {
  name: string;
  passed: boolean;
  score: number;
  detail: string;
};

type VerificationResult = {
  result: "approved" | "rejected";
  confidence: number;
  reasonCodes: string[];
  checks: CheckResult[];
  mediaSignals: Omit<ActionMediaSignalsRecord, "createdAt" | "updatedAt">;
};

export class VerificationService {
  async verify(action: ActionRecord): Promise<VerificationResult> {
    const media = await photoAnalysisService.analyze(action.photoUrl, action.location);
    const duplicateAction =
      env.ENABLE_IMAGE_HASH_DUPLICATE_CHECK && media.imageHash
        ? await actionsRepository.findDuplicateByImageHash({
            imageHash: media.imageHash,
            actionId: action.id,
            userId: action.userId,
          })
        : null;

    const checks: CheckResult[] = [
      {
        name: "evidence_presence",
        passed: Boolean(action.photoUrl),
        score: action.photoUrl ? 100 : 0,
        detail: action.photoUrl
          ? "Evidence reference provided"
          : "Missing evidence reference",
      },
      {
        name: "timestamp_validity",
        passed: !Number.isNaN(Date.parse(action.submittedAt)),
        score: Number.isNaN(Date.parse(action.submittedAt)) ? 0 : 100,
        detail: Number.isNaN(Date.parse(action.submittedAt))
          ? "Submission timestamp is invalid"
          : "Submission timestamp is parseable",
      },
      {
        name: "quantity_bounds",
        passed: action.quantity > 0 && action.quantity <= 10000,
        score: action.quantity > 0 && action.quantity <= 10000 ? 100 : 0,
        detail:
          action.quantity > 0 && action.quantity <= 10000
            ? "Quantity is within allowed bounds"
            : "Quantity is outside allowed bounds",
      },
      {
        name: "location_presence",
        passed: Boolean(action.location.trim()),
        score: action.location.trim() ? 100 : 0,
        detail: action.location.trim() ? "Location provided" : "Missing location",
      },
    ];

    if (env.ENABLE_LOCATION_MATCH_CHECK) {
      const locationMatched =
        media.locationDistanceKm === null
          ? true
          : media.locationDistanceKm <= env.LOCATION_MATCH_MAX_KM;

      checks.push({
        name: "location_exif_distance_match",
        passed: locationMatched,
        score:
          media.locationDistanceKm === null
            ? 60
            : locationMatched
              ? 100
              : 0,
        detail:
          media.locationDistanceKm === null
            ? "EXIF GPS or geocoding unavailable; distance check skipped"
            : `EXIF-to-claimed location distance ${media.locationDistanceKm.toFixed(1)} km`,
      });
    }

    if (env.ENABLE_STOCK_PHOTO_CHECK) {
      const passed = media.stockRiskScore < env.STOCK_RISK_REJECT_THRESHOLD;
      checks.push({
        name: "stock_photo_risk",
        passed,
        score: Math.max(0, 100 - media.stockRiskScore),
        detail:
          media.stockSignals.length > 0
            ? `Stock-risk ${media.stockRiskScore}: ${media.stockSignals.join(", ")}`
            : `Stock-risk ${media.stockRiskScore}: no stock indicators`,
      });
    }

    if (env.ENABLE_IMAGE_HASH_DUPLICATE_CHECK) {
      checks.push({
        name: "image_reuse_detection",
        passed: !duplicateAction,
        score: duplicateAction ? 0 : 100,
        detail: duplicateAction
          ? `Image hash already used in action ${duplicateAction.id}`
          : "No matching image hash found across other contributors",
      });
    }

    const reasonCodes = checks
      .filter((check) => !check.passed)
      .map((check) => check.name.toUpperCase());

    const hardRejectChecks = new Set(["stock_photo_risk", "image_reuse_detection"]);
    const hasHardReject = checks.some(
      (check) => !check.passed && hardRejectChecks.has(check.name),
    );
    const approved = !hasHardReject && reasonCodes.length === 0;
    const confidence = Math.round(
      checks.reduce((acc, check) => acc + check.score, 0) / checks.length,
    );

    return {
      result: approved ? "approved" : "rejected",
      confidence,
      reasonCodes: approved ? ["RULES_PASSED"] : reasonCodes,
      checks,
      mediaSignals: {
        actionId: action.id,
        sourceKind: media.sourceKind,
        imageHash: media.imageHash,
        stockRiskScore: media.stockRiskScore,
        stockSignals: media.stockSignals,
        exifLatitude: media.exifLatitude,
        exifLongitude: media.exifLongitude,
        exifCapturedAt: media.exifCapturedAt,
        claimedLatitude: media.claimedLatitude,
        claimedLongitude: media.claimedLongitude,
        locationDistanceKm: media.locationDistanceKm,
      },
    } as const;
  }
}

export const verificationService = new VerificationService();
