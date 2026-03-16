import type { ActionRecord } from "../types/domain.js";

export class VerificationService {
  verify(action: ActionRecord) {
    const reasonCodes: string[] = [];

    if (!action.photoUrl) {
      reasonCodes.push("MISSING_EVIDENCE");
    }

    if (Number.isNaN(Date.parse(action.submittedAt))) {
      reasonCodes.push("INVALID_TIMESTAMP");
    }

    if (action.quantity <= 0 || action.quantity > 10000) {
      reasonCodes.push("INVALID_QUANTITY");
    }

    if (!action.location.trim()) {
      reasonCodes.push("MISSING_LOCATION");
    }

    const approved = reasonCodes.length === 0;

    return {
      result: approved ? "approved" : "rejected",
      confidence: approved ? 96 : 54,
      reasonCodes: approved ? ["RULES_PASSED"] : reasonCodes,
    } as const;
  }
}

export const verificationService = new VerificationService();
