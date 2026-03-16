export type ActionStatus = "submitted" | "queued" | "approved" | "rejected";

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

export interface AttestationRecord {
  id: string;
  actionId: string;
  topicId: string;
  messageId: string;
  txId: string;
  proofHash: string;
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
