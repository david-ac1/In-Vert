import type {
  ActionRecord,
  AttestationRecord,
  RewardRecord,
  VerificationRecord,
} from "./domain.js";

export interface ActionStatusResponse {
  action: ActionRecord | null;
  verification: VerificationRecord | null;
  attestation: AttestationRecord | null;
  reward: RewardRecord | null;
}

export interface VerificationQueueItem {
  id: string;
  type: string;
  result: string;
  score: number;
  verifiedAt: string;
}
