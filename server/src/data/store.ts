import type {
  ActionRecord,
  AttestationRecord,
  FeedItem,
  RewardRecord,
  UserRecord,
  VerificationRecord,
} from "../types/domain.js";

export const store = {
  users: new Map<string, UserRecord>(),
  actions: new Map<string, ActionRecord>(),
  verifications: new Map<string, VerificationRecord>(),
  attestations: new Map<string, AttestationRecord>(),
  rewards: new Map<string, RewardRecord>(),
  feed: [] as FeedItem[],
};
