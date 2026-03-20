export type ActionStatus = "submitted" | "queued" | "processing" | "approved" | "rejected";

export interface UserRecord {
  id: string;
  walletAddress: string;
  username: string;
  totalRewards: number;
  actionsSubmitted: number;
  createdAt: string;
}

export interface ActionRecord {
  id: string;
  userId: string;
  actionType: string;
  description: string;
  quantity: number;
  location: string;
  photoUrl: string;
  status: ActionStatus;
  submittedAt: string;
  updatedAt: string;
}

export interface VerificationRecord {
  id: string;
  actionId: string;
  agentId: string;
  result: Extract<ActionStatus, "approved" | "rejected">;
  confidence: number;
  reasonCodes: string[];
  verifiedAt: string;
}

export interface VerificationCheckRecord {
  id: string;
  verificationId: string;
  checkName: string;
  passed: boolean;
  score: number;
  detail: string;
  createdAt: string;
}

export interface ActionMediaSignalsRecord {
  actionId: string;
  sourceKind: "uploaded_file" | "external_url" | "unknown";
  imageHash: string | null;
  stockRiskScore: number;
  stockSignals: string[];
  exifLatitude: number | null;
  exifLongitude: number | null;
  exifCapturedAt: string | null;
  claimedLatitude: number | null;
  claimedLongitude: number | null;
  locationDistanceKm: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AttestationRecord {
  id: string;
  actionId: string;
  topicId: string;
  messageId: string;
  txId: string;
  proofHash: string;
  /** HSCS SustainabilityRegistry contract transaction ID (set after deploy) */
  contractTxId?: string;
  createdAt: string;
}

export interface RewardRecord {
  id: string;
  userId: string;
  actionId: string;
  tokenAmount: number;
  txId: string;
  createdAt: string;
}

export interface FeedItem {
  id: string;
  type: "verification" | "reward";
  message: string;
  createdAt: string;
}
