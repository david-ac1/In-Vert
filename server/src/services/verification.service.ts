import type { ActionRecord } from "../types/domain.js";

type CheckResult = {
  name: string;
  passed: boolean;
  score: number;
  detail: string;
};

export class VerificationService {
  verify(action: ActionRecord) {
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

    const reasonCodes = checks
      .filter((check) => !check.passed)
      .map((check) => check.name.toUpperCase());

    const approved = reasonCodes.length === 0;
    const confidence = Math.round(
      checks.reduce((acc, check) => acc + check.score, 0) / checks.length,
    );

    return {
      result: approved ? "approved" : "rejected",
      confidence,
      reasonCodes: approved ? ["RULES_PASSED"] : reasonCodes,
      checks,
    } as const;
  }
}

export const verificationService = new VerificationService();
